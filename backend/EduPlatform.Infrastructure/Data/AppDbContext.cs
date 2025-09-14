using Microsoft.EntityFrameworkCore;
using EduPlatform.Core.Entities;

namespace EduPlatform.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Core domain sets
    public DbSet<User> Users => Set<User>();
    public DbSet<Series> Series => Set<Series>();
    public DbSet<Vestibular> Vestibulares => Set<Vestibular>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Content> Contents => Set<Content>();
    public DbSet<Checklist> Checklists => Set<Checklist>();
    public DbSet<TopicSubject> TopicSubjects => Set<TopicSubject>();

    // Vestibular related sets (many-to-many and contents)
    public DbSet<VestibularSubject> VestibularSubjects => Set<VestibularSubject>();
    public DbSet<VestibularContent> VestibularContents => Set<VestibularContent>();

    // Accessibility sets
    public DbSet<AccessibilityCategory> AccessibilityCategories => Set<AccessibilityCategory>();
    public DbSet<AccessibilityCategoryTopic> AccessibilityCategoryTopics => Set<AccessibilityCategoryTopic>();
    public DbSet<AccessibilityTheme> AccessibilityThemes => Set<AccessibilityTheme>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ---------------------------
        // TopicSubject (manual many-to-many)
        // ---------------------------
        modelBuilder.Entity<TopicSubject>()
            .HasKey(ts => new { ts.TopicId, ts.SubjectId });

        modelBuilder.Entity<TopicSubject>()
            .HasOne(ts => ts.Topic)
            .WithMany(t => t.TopicSubjects)
            .HasForeignKey(ts => ts.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TopicSubject>()
            .HasOne(ts => ts.Subject)
            .WithMany(s => s.TopicSubjects)
            .HasForeignKey(ts => ts.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // ---------------------------
        // Series -> Subjects (one-to-many)
        // ---------------------------
        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Series)
            .WithMany(ses => ses.Subjects)
            .HasForeignKey(s => s.SeriesId)
            .OnDelete(DeleteBehavior.SetNull);

        // ---------------------------
        // Topic -> Contents (one-to-many)
        // ---------------------------
        modelBuilder.Entity<Content>()
            .HasOne(c => c.Topic)
            .WithMany(t => t.Contents)
            .HasForeignKey(c => c.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        // ---------------------------
        // Vestibular <-> Subject (many-to-many via VestibularSubject)
        // ---------------------------
        modelBuilder.Entity<VestibularSubject>()
            .HasKey(vs => new { vs.VestibularId, vs.SubjectId });

        modelBuilder.Entity<VestibularSubject>()
            .HasOne(vs => vs.Vestibular)
            .WithMany(v => v.VestibularSubjects)
            .HasForeignKey(vs => vs.VestibularId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VestibularSubject>()
            .HasOne(vs => vs.Subject)
            .WithMany() // we don't need reverse navigation on Subject (already has TopicSubjects)
            .HasForeignKey(vs => vs.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // ---------------------------
        // VestibularContent -> Vestibular (one-to-many)
        // ---------------------------
        modelBuilder.Entity<VestibularContent>()
            .HasKey(vc => vc.Id);

        modelBuilder.Entity<VestibularContent>()
            .HasOne(vc => vc.Vestibular)
            .WithMany(v => v.Contents)
            .HasForeignKey(vc => vc.VestibularId)
            .OnDelete(DeleteBehavior.Cascade);

        // VestibularContent -> Original Content (optional)
        modelBuilder.Entity<VestibularContent>()
            .HasOne(vc => vc.OriginalContent)
            .WithMany() // do not cascade-delete original content when vestibular content is removed
            .HasForeignKey(vc => vc.OriginalContentId)
            .OnDelete(DeleteBehavior.SetNull);

        // ---------------------------
        // Accessibility: category <-> topic (many-to-many via AccessibilityCategoryTopic)
        // ---------------------------
        modelBuilder.Entity<AccessibilityCategoryTopic>()
            .HasKey(at => new { at.AccessibilityCategoryId, at.TopicId });

        modelBuilder.Entity<AccessibilityCategoryTopic>()
            .HasOne(at => at.AccessibilityCategory)
            .WithMany(c => c.CategoryTopics)
            .HasForeignKey(at => at.AccessibilityCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AccessibilityCategoryTopic>()
            .HasOne(at => at.Topic)
            .WithMany()
            .HasForeignKey(at => at.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        // ---------------------------
        // AccessibilityTheme (per-category instructions/themes)
        // ---------------------------
        modelBuilder.Entity<AccessibilityTheme>()
            .HasKey(t => t.Id);

        modelBuilder.Entity<AccessibilityTheme>()
            .HasOne(t => t.AccessibilityCategory)
            .WithMany(c => c.Themes)
            .HasForeignKey(t => t.AccessibilityCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Optional: Some indices to speed up common queries
        modelBuilder.Entity<VestibularSubject>().HasIndex(vs => vs.SubjectId);
        modelBuilder.Entity<VestibularContent>().HasIndex(vc => vc.VestibularId);
        modelBuilder.Entity<AccessibilityCategoryTopic>().HasIndex(at => at.TopicId);

        base.OnModelCreating(modelBuilder);
    }
}
