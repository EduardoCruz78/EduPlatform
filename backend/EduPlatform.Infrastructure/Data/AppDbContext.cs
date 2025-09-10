// === File: /backend/EduPlatform.Infrastructure/Data/AppDbContext.cs ===
using EduPlatform.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Series> Series => Set<Series>();
    public DbSet<Vestibular> Vestibulares => Set<Vestibular>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Content> Contents => Set<Content>();
    public DbSet<Checklist> Checklists => Set<Checklist>();
    public DbSet<TopicSubject> TopicSubjects => Set<TopicSubject>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Composite key for TopicSubject (many-to-many manual join)
        modelBuilder.Entity<TopicSubject>()
            .HasKey(ts => new { ts.TopicId, ts.SubjectId });

        modelBuilder.Entity<TopicSubject>()
            .HasOne(ts => ts.Topic)
            .WithMany(t => t.TopicSubjects)
            .HasForeignKey(ts => ts.TopicId);

        modelBuilder.Entity<TopicSubject>()
            .HasOne(ts => ts.Subject)
            .WithMany(s => s.TopicSubjects)
            .HasForeignKey(ts => ts.SubjectId);

        // Series -> Subjects (one-to-many)
        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Series)
            .WithMany(ses => ses.Subjects)
            .HasForeignKey(s => s.SeriesId)
            .OnDelete(DeleteBehavior.SetNull);

        base.OnModelCreating(modelBuilder);
    }
}