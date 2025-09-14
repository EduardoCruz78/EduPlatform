using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;



namespace EduPlatform.Infrastructure.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
            var basePath = Directory.GetCurrentDirectory();

            // tenta localizar appsettings.json no projeto Api se estivermos rodando a partir do folder Infrastructure
            var apiPath = Path.Combine(basePath, "..", "EduPlatform.Api");
            if (Directory.Exists(apiPath) && File.Exists(Path.Combine(apiPath, "appsettings.json")))
            {
                basePath = apiPath;
            }

            var config = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile($"appsettings.{env}.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var conn = config.GetConnectionString("DefaultConnection")
                       ?? Environment.GetEnvironmentVariable("DEFAULT_CONNECTION")
                       ?? Environment.GetEnvironmentVariable("DefaultConnection");

            if (string.IsNullOrWhiteSpace(conn))
            {
                throw new InvalidOperationException("DefaultConnection not found. Set it in appsettings.json or DEFAULT_CONNECTION environment variable.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(conn, b => b.MigrationsAssembly("EduPlatform.Infrastructure"));

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
