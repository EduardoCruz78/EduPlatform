// === File: /backend/EduPlatform.Infrastructure/Repositories/Repository.cs ===
using EduPlatform.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly DbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(DbContext context)
    {
        _context = context;
        _dbSet = _context.Set<T>();
    }

    public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);
    public async Task<T?> GetAsync(int id) => await _dbSet.FindAsync(id) as T;
    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.AsNoTracking().ToListAsync();
    public void Remove(T entity) => _dbSet.Remove(entity);
    public void Update(T entity) => _dbSet.Update(entity);
}