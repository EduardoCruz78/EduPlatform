// === File: /backend/EduPlatform.Api/Controllers/SubjectsController.cs ===
using EduPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using EduPlatform.Core.DTOs;

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/subjects")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    public SubjectsController(AppDbContext db, IMapper mapper) => (_db, _mapper) = (db, mapper);

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(_mapper.Map<IEnumerable<SubjectDto>>(await _db.Subjects.AsNoTracking().ToListAsync()));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var subject = await _db.Subjects.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        if (subject == null) return NotFound();
        return Ok(_mapper.Map<SubjectDto>(subject));
    }

    [HttpGet("{id:int}/topics")]
    public async Task<IActionResult> GetTopics(int id)
    {
        var topics = await _db.TopicSubjects
            .Where(ts => ts.SubjectId == id)
            .Select(ts => ts.Topic)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TopicDto>>(topics));
    }
}