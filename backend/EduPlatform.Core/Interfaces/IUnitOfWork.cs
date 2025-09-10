// === File: /backend/EduPlatform.Core/Interfaces/IUnitOfWork.cs ===

using EduPlatform.Core.Entities;

namespace EduPlatform.Core.Interfaces;

public interface IUnitOfWork : IAsyncDisposable
{
    IRepository<Series> SeriesRepository { get; }
    IRepository<Subject> SubjectRepository { get; }
    IRepository<Topic> TopicRepository { get; }
    IRepository<Content> ContentRepository { get; }

    Task<int> SaveChangesAsync();
}