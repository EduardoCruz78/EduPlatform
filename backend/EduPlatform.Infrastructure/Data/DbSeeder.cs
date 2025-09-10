// === File: /backend/EduPlatform.Infrastructure/Data/DbSeeder.cs ===
using EduPlatform.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (!await context.Series.AnyAsync())
        {
            var series = new List<Series>
            {
                // Fundamental
                new Series { Name = "1º ano do Fundamental" },
                new Series { Name = "2º ano do Fundamental" },
                new Series { Name = "3º ano do Fundamental" },
                new Series { Name = "4º ano do Fundamental" },
                new Series { Name = "5º ano do Fundamental" },
                new Series { Name = "6º ano do Fundamental" },
                new Series { Name = "7º ano do Fundamental" },
                new Series { Name = "8º ano do Fundamental" },
                new Series { Name = "9º ano do Fundamental" },

                // Ensino Médio
                new Series { Name = "1º ano do Ensino Médio" },
                new Series { Name = "2º ano do Ensino Médio" },
                new Series { Name = "3º ano do Ensino Médio" }
            };

            context.Series.AddRange(series);
            await context.SaveChangesAsync();
        }
    }
}