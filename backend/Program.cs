using EShopManager.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// Configure MongoDB
var mongoDbSettings = builder.Configuration.GetSection("EShopDatabase").Get<MongoDBSettings>();
if (mongoDbSettings != null)
{
    builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoDbSettings.ConnectionString));
    builder.Services.AddScoped(sp => 
    {
        var client = sp.GetRequiredService<IMongoClient>();
        return client.GetDatabase(mongoDbSettings.DatabaseName);
    });
    
    // Register application services
    builder.Services.AddScoped<EShopManager.API.Services.UserService>();
    builder.Services.AddScoped<EShopManager.API.Services.ProductService>();
    builder.Services.AddScoped<EShopManager.API.Services.CartService>();
    builder.Services.AddScoped<EShopManager.API.Services.WishlistService>();
    builder.Services.AddScoped<EShopManager.API.Services.OrderService>();
    builder.Services.AddScoped<EShopManager.API.Services.SubscriptionService>();
    builder.Services.AddScoped<EShopManager.API.Services.MembershipService>();
    builder.Services.AddScoped<EShopManager.API.Services.AdminAnalyticsService>();
}

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings.GetValue<string>("Secret");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey ?? string.Empty))
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed the database with initial products if needed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
    try
    {
        await EShopManager.API.Data.DatabaseSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        // Log seeding failure to console. Do not prevent app from starting.
        Console.WriteLine($"Database seeding failed: {ex.Message}");
    }
}

app.Run();
