// === File: /backend/EduPlatform.Api/Controllers/ContentsController.cs ===
using System;
using System.Linq;
using System.Threading.Tasks;
using EduPlatform.Core.DTOs;
using EduPlatform.Core.Entities;
using EduPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ContentsController(AppDbContext db) => _db = db;

    // GET /api/contents
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Contents.AsNoTracking().ToListAsync();
        var dto = list.Select(c => new {
            id = c.Id,
            title = c.Title,
            type = c.Type,
            link = c.Link,
            thumbnailUrl = c.ThumbnailUrl,
            topicId = c.TopicId
        });
        return Ok(dto);
    }

    // GET /api/contents/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var content = await _db.Contents.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (content == null) return NotFound();
        return Ok(new {
            id = content.Id,
            title = content.Title,
            type = content.Type,
            link = content.Link,
            thumbnailUrl = content.ThumbnailUrl,
            topicId = content.TopicId
        });
    }

    // POST /api/contents
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ContentDto dto)
    {
        try
        {
            // basic validation and clearer messages
            if (dto == null) return BadRequest("Payload inválido (body ausente).");
            if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required.");
            if (dto.TopicId <= 0) return BadRequest("TopicId is required and must be > 0.");

            // verify topic exists
            var topic = await _db.Topics.FindAsync(dto.TopicId);
            if (topic == null) return BadRequest($"Topic not found (id={dto.TopicId}).");

            var entity = new Content
            {
                Title = dto.Title,
                Type = string.IsNullOrWhiteSpace(dto.Type) ? "Video" : dto.Type,
                Link = dto.Link ?? string.Empty,
                ThumbnailUrl = dto.ThumbnailUrl ?? string.Empty,
                TopicId = dto.TopicId
            };

            _db.Contents.Add(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = entity.Id }, new {
                id = entity.Id,
                title = entity.Title,
                type = entity.Type,
                link = entity.Link,
                thumbnailUrl = entity.ThumbnailUrl,
                topicId = entity.TopicId
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[ContentsController.Create] Erro ao criar content: {ex}");
            return Problem($"Erro interno ao criar conteúdo: {ex.Message}");
        }
    }

    // PUT /api/contents/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ContentDto dto)
    {
        if (dto == null || id != dto.Id) return BadRequest();
        var entity = await _db.Contents.FindAsync(id);
        if (entity == null) return NotFound();

        // validate topic exists
        var topic = await _db.Topics.FindAsync(dto.TopicId);
        if (topic == null) return BadRequest($"Topic not found (id={dto.TopicId}).");

        entity.Title = dto.Title;
        entity.Type = dto.Type;
        entity.Link = dto.Link;
        entity.ThumbnailUrl = dto.ThumbnailUrl;
        entity.TopicId = dto.TopicId;

        _db.Contents.Update(entity);
        await _db.SaveChangesAsync();

        return Ok(new {
            id = entity.Id,
            title = entity.Title,
            type = entity.Type,
            link = entity.Link,
            thumbnailUrl = entity.ThumbnailUrl,
            topicId = entity.TopicId
        });
    }

    // DELETE /api/contents/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Contents.FindAsync(id);
        if (entity == null) return NotFound();

        _db.Contents.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
