// === File: /backend/EduPlatform.Api/Controllers/SubjectsController.cs ===
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EduPlatform.Core.DTOs;
using EduPlatform.Core.Entities;
using EduPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public SubjectsController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // GET /api/subjects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubjectDto>>> GetAll()
    {
        var list = await _context.Subjects
            .Include(s => s.Series)
            .AsNoTracking()
            .ToListAsync();

        var dtos = list.Select(s => new SubjectDto
        {
            Id = s.Id,
            Name = s.Name,
            SeriesId = s.SeriesId,
            Series = s.Series != null ? new SeriesDto { Id = s.Series.Id, Name = s.Series.Name } : null
        });

        return Ok(dtos);
    }

    // GET /api/subjects/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SubjectDto>> GetById(int id)
    {
        var s = await _context.Subjects
            .Include(x => x.Series)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (s == null) return NotFound();

        var dto = new SubjectDto
        {
            Id = s.Id,
            Name = s.Name,
            SeriesId = s.SeriesId,
            Series = s.Series != null ? new SeriesDto { Id = s.Series.Id, Name = s.Series.Name } : null
        };

        return Ok(dto);
    }

    // POST /api/subjects
    [HttpPost]
    public async Task<ActionResult<SubjectDto>> Create([FromBody] SubjectDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required.");

        var entity = new Subject
        {
            Name = dto.Name,
            SeriesId = dto.SeriesId
        };

        _context.Subjects.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
    }

    // PUT /api/subjects/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SubjectDto dto)
    {
        if (dto == null || id != dto.Id)
            return BadRequest();

        var entity = await _context.Subjects.FindAsync(id);
        if (entity == null) return NotFound();

        entity.Name = dto.Name;
        entity.SeriesId = dto.SeriesId;

        _context.Subjects.Update(entity);
        await _context.SaveChangesAsync();

        return Ok(dto);
    }

    // DELETE /api/subjects/{id}
    // Behavior: delete subject, delete topic-subject join rows, and delete topics that become orphan (i.e., were linked only to this subject)
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        // Use transaction for safety
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return NotFound();

            // 1) Get topic IDs linked to this subject
            var topicIds = await _context.TopicSubjects
                .AsNoTracking()
                .Where(ts => ts.SubjectId == id)
                .Select(ts => ts.TopicId)
                .ToListAsync();

            // 2) Remove TopicSubject join rows for this subject
            var joins = await _context.TopicSubjects.Where(ts => ts.SubjectId == id).ToListAsync();
            if (joins.Any())
            {
                _context.TopicSubjects.RemoveRange(joins);
                await _context.SaveChangesAsync();
            }

            // 3) For each topic linked, check if it remains linked to any other subject.
            // If not linked to any other subject, delete its contents and the topic.
            foreach (var topicId in topicIds.Distinct())
            {
                var remaining = await _context.TopicSubjects.AnyAsync(ts => ts.TopicId == topicId);
                if (!remaining)
                {
                    // delete contents of topic (explicit)
                    var contents = await _context.Contents.Where(c => c.TopicId == topicId).ToListAsync();
                    if (contents.Any())
                    {
                        _context.Contents.RemoveRange(contents);
                        await _context.SaveChangesAsync();
                    }

                    // delete the topic itself
                    var topic = await _context.Topics.FindAsync(topicId);
                    if (topic != null)
                    {
                        _context.Topics.Remove(topic);
                        await _context.SaveChangesAsync();
                    }
                }
            }

            // 4) Finally delete the subject
            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            await tx.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            Console.Error.WriteLine($"[SubjectsController.Delete] Erro ao deletar subject {id}: {ex}");
            return Problem($"Erro ao deletar matéria: {ex.Message}", statusCode: 500);
        }
    }

    // GET /api/subjects/{id}/topics
    [HttpGet("{id:int}/topics")]
    public async Task<IActionResult> GetTopics(int id)
    {
        var topicIds = await _context.TopicSubjects
            .AsNoTracking()
            .Where(ts => ts.SubjectId == id)
            .Select(ts => ts.TopicId)
            .ToListAsync();

        var topics = await _context.Topics
            .AsNoTracking()
            .Where(t => topicIds.Contains(t.Id))
            .ToListAsync();

        var dto = topics.Select(t => new TopicDto { Id = t.Id, Name = t.Name });
        return Ok(dto);
    }
}
