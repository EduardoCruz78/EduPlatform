/*
 
 
 // === File: /backend/EduPlatform.Tests/SeriesControllerTests.cs


using EduPlatform.Core.Entities;
using EduPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;
using EduPlatform.Api.Controllers;
using EduPlatform.Core.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.Tests;

public class SeriesControllerTests
{
    private AppDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetSubjects_ReturnsSubjects_ForGivenSeries()
    {
        using var db = CreateInMemoryDb();
        var series = new Series { Name = "1st Year" };
        db.Series.Add(series);
        await db.SaveChangesAsync();

        var subj = new Subject { Name = "Math", SeriesId = series.Id };
        db.Subjects.Add(subj);
        await db.SaveChangesAsync();

        var mapperConfig = new AutoMapper.MapperConfiguration(cfg => { cfg.CreateMap<Subject, SubjectDto>(); }, null);

        var mapper = mapperConfig.CreateMapper();


        var controller = new SeriesController(db, mapper);
        var result = await controller.GetSubjects(series.Id) as OkObjectResult;
        Assert.NotNull(result);
    }
}

 */ 