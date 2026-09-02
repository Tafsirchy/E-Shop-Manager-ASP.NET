using EShopManager.API.Data;
using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.ResponseCompression;
using MongoDB.Driver;
using Serilog;
using Stripe;
using System.IO.Compression;
using Microsoft.AspNetCore.HttpOverrides;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/eshop-log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting web application");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllersWithViews();

// Cache public catalog API responses; Razor pages are excluded because their forms
// embed per-user antiforgery tokens that must not be shared across visitors.
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("CatalogGet30s", b => b
        .Expire(TimeSpan.FromSeconds(30))
        .SetVaryByQuery("*")
        .Tag("catalog"));
});

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "image/svg+xml",
        "application/json"
    });
});
builder.Services.Configure<BrotliCompressionProviderOptions>(o => o.Level = CompressionLevel.Fastest);
builder.Services.Configure<GzipCompressionProviderOptions>(o => o.Level = CompressionLevel.Fastest);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "EShopAuth";
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Home/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(12);
        options.SlidingExpiration = true;
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.IsEssential = true;
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

// Brute-force protection for authentication endpoints: max 10 attempts per
// minute per client IP (covers both MVC form posts and the JWT REST API).
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth-ip", context =>
        System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

var mongoDbSettings = builder.Configuration.GetSection("EShopDatabase").Get<MongoDBSettings>();
if (mongoDbSettings != null)
{
    builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoDbSettings.ConnectionString));
    builder.Services.AddScoped(sp =>
    {
        var client = sp.GetRequiredService<IMongoClient>();
        return client.GetDatabase(mongoDbSettings.DatabaseName);
    });

    builder.Services.AddScoped<EShopManager.API.Services.UserService>();
    builder.Services.AddScoped<EShopManager.API.Services.ProductService>();
    builder.Services.AddScoped<EShopManager.API.Services.CartService>();
    builder.Services.AddScoped<EShopManager.API.Services.WishlistService>();
    builder.Services.AddScoped<EShopManager.API.Services.OrderService>();
    builder.Services.AddScoped<EShopManager.API.Services.ReviewService>();
    builder.Services.AddScoped<EShopManager.API.Services.SubscriptionService>();
    builder.Services.AddScoped<EShopManager.API.Services.MembershipService>();
    builder.Services.AddScoped<EShopManager.API.Services.AdminAnalyticsService>();
    builder.Services.AddScoped<EShopManager.API.Services.EmailService>();
    builder.Services.AddScoped<EShopManager.API.Services.PdfService>();
}

builder.Services.AddScoped<CurrentUser>();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<SecurityStampValidator>();

var app = builder.Build();

app.UseForwardedHeaders();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseStatusCodePagesWithReExecute("/Home/Error", "?statusCode={0}");
}

app.UseResponseCompression();

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.CacheControl = "public,max-age=31536000,immutable";
    }
});

app.UseRouting();

app.UseRateLimiter();

app.UseAuthentication();

// Revoke sessions whose security stamp no longer matches the database
// (role changes, bans). Old cookies are signed out; stale JWTs become anonymous.
app.Use(async (context, next) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var validator = context.RequestServices.GetRequiredService<SecurityStampValidator>();
        if (!await validator.IsCurrentAsync(context.User))
        {
            await context.SignOutAsync(Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme);
            context.User = new System.Security.Claims.ClaimsPrincipal(
                new System.Security.Claims.ClaimsIdentity());
        }
    }
    await next();
});

app.UseAuthorization();

// Short-lived private caching of catalog pages for anonymous visitors so that
// hover/touch prefetches (site.js) are reused by the subsequent navigation.
// Skipped when a TempData cookie is present (a status banner would be rendered)
// and for authenticated users (wishlist state and admin UI personalize pages).
// Uses OnStarting because antiforgery stamping forms marks responses no-store
// during rendering; anonymous catalog GETs are safe to override for a few seconds.
var tempDataCookieName = ".AspNetCore.Mvc.CookieTempDataProvider";
app.Use(async (context, next) =>
{
    var req = context.Request;
    var cacheable =
        HttpMethods.IsGet(req.Method) &&
        !(context.User.Identity?.IsAuthenticated ?? false) &&
        !req.Cookies.ContainsKey(tempDataCookieName) &&
        (req.Path.StartsWithSegments("/Products") || req.Path.StartsWithSegments("/Home"));

    if (cacheable)
    {
        context.Response.OnStarting(() =>
        {
            if (context.Response.StatusCode == StatusCodes.Status200OK)
            {
                context.Response.Headers.CacheControl = "private, max-age=20";
            }
            return Task.CompletedTask;
        });
    }

    await next();
});

app.UseOutputCache();

app.MapDefaultControllerRoute();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
    try
    {
        await DatabaseSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database seeding failed: {ex.Message}");
    }
}

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
