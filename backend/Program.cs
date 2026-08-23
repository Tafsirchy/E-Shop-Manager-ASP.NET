using EShopManager.API.Data;
using EShopManager.API.Models;
using EShopManager.API.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IO.Compression;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

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

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddScoped<TokenService>();

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
    })
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

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
}

builder.Services.AddScoped<CurrentUser>();

var app = builder.Build();

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

app.UseAuthentication();
app.UseAuthorization();

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
