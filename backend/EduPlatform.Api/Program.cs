// === File: /backend/EduPlatform.Api/Program.cs ===
using EduPlatform.Infrastructure.Data;
using EduPlatform.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using EduPlatform.Api.Mapping;
using EduPlatform.Core.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var configuration = builder.Configuration;

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AutoMapper (scan assembly)
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile).Assembly);


// Register DbContext (PostgreSQL)
var conn = configuration.GetConnectionString("DefaultConnection") ?? Environment.GetEnvironmentVariable("DEFAULT_CONNECTION");
if (string.IsNullOrEmpty(conn))
{
    throw new InvalidOperationException("DefaultConnection not configured. Set it in appsettings.json or the DEFAULT_CONNECTION environment variable.");
}

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(conn));

// UnitOfWork
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
    .AddCookie()
    .AddGoogle(options =>
    {
        options.ClientId = configuration["Authentication:Google:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
        options.ClientSecret = configuration["Authentication:Google:ClientSecret"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");
        options.Scope.Add("openid");
        options.Scope.Add("profile");
        options.Scope.Add("email");
    });

// Add CORS (permitindo o frontend local)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Apply pending migrations on startup (development convenience)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate(); // cria as tabelas se não existirem
    await DbSeeder.SeedAsync(db); // adiciona as séries
}

// CORS precisa vir antes de Authentication/Authorization
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
