// === File: /backend/EduPlatform.Api/Controllers/TopicsController.cs ===
using EduPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using EduPlatform.Core.DTOs;

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/topics")]
public class TopicsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    public TopicsController(AppDbContext db, IMapper mapper) => (_db, _mapper) = (db, mapper);

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
            return Ok(_mapper.Map<IEnumerable<TopicDto>>(await _db.Topics.AsNoTracking().ToListAsync()));

        var q = search.Trim().ToLower();
        var list = await _db.Topics.AsNoTracking()
            .Where(t => t.Name.ToLower().Contains(q))
            .ToListAsync();
        return Ok(_mapper.Map<IEnumerable<TopicDto>>(list));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var topic = await _db.Topics.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (topic == null) return NotFound();
        return Ok(_mapper.Map<TopicDto>(topic));
    }

    [HttpGet("{id:int}/contents")]
    public async Task<IActionResult> GetContents(int id)
    {
        var contents = await _db.Contents.Where(c => c.TopicId == id).AsNoTracking().ToListAsync();
        return Ok(contents);
    }
}