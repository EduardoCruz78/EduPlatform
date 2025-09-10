// === File: /backend/EduPlatform.Infrastructure/Repositories/UnitOfWork.cs ===
using EduPlatform.Core.Entities;
using EduPlatform.Core.Interfaces;
using EduPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IRepository<Series> SeriesRepository { get; }
    public IRepository<Subject> SubjectRepository { get; }
    public IRepository<Topic> TopicRepository { get; }
    public IRepository<Content> ContentRepository { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        SeriesRepository = new Repository<Series>(context);
        SubjectRepository = new Repository<Subject>(context);
        TopicRepository = new Repository<Topic>(context);
        ContentRepository = new Repository<Content>(context);
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public async ValueTask DisposeAsync()
    {
        await _context.DisposeAsync();
    }
}