// === File: /backend/EduPlatform.Core/Interfaces/IRepository.cs ===
namespace EduPlatform.Core.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Remove(T entity);
}