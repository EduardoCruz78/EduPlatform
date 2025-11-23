namespace EduPlatform.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Core
    public DbSet<User> Users => Set<User>();
    public DbSet<Series> Series => Set<Series>();
    public DbSet<Vestibular> Vestibulares => Set<Vestibular>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Content> Contents => Set<Content>();
    public DbSet<Checklist> Checklists => Set<Checklist>();
    public DbSet<TopicSubject> TopicSubjects => Set<TopicSubject>();

    // Vestibular
    public DbSet<VestibularSubject> VestibularSubjects => Set<VestibularSubject>();
    public DbSet<VestibularContent> VestibularContents => Set<VestibularContent>();

    // Accessibility
    public DbSet<AccessibilityCategory> AccessibilityCategories => Set<AccessibilityCategory>();
    public DbSet<AccessibilityCategoryTopic> AccessibilityCategoryTopics => Set<AccessibilityCategoryTopic>();
    public DbSet<AccessibilityTheme> AccessibilityThemes => Set<AccessibilityTheme>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // TopicSubject
        modelBuilder.Entity<TopicSubject>()
            .HasKey(ts => new { ts.TopicId, ts.SubjectId });

        // Series -> Subjects
        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Series)
            .WithMany(se => se.Subjects)
            .HasForeignKey(s => s.SeriesId)
            .OnDelete(DeleteBehavior.SetNull);

        // Topic -> Contents
        modelBuilder.Entity<Content>()
            .HasOne(c => c.Topic)
            .WithMany(t => t.Contents)
            .HasForeignKey(c => c.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        // Vestibular <-> Subject
        modelBuilder.Entity<VestibularSubject>()
            .HasKey(vs => new { vs.VestibularId, vs.SubjectId });

        modelBuilder.Entity<VestibularSubject>()
            .HasOne(vs => vs.Vestibular)
            .WithMany(v => v.VestibularSubjects)
            .HasForeignKey(vs => vs.VestibularId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VestibularSubject>()
            .HasOne(vs => vs.Subject)
            .WithMany()
            .HasForeignKey(vs => vs.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // VestibularContent
        modelBuilder.Entity<VestibularContent>()
            .HasKey(vc => vc.Id);

        modelBuilder.Entity<VestibularContent>()
            .HasOne(vc => vc.Vestibular)
            .WithMany(v => v.Contents)
            .HasForeignKey(vc => vc.VestibularId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VestibularContent>()
            .HasOne(vc => vc.OriginalContent)
            .WithMany()
            .HasForeignKey(vc => vc.OriginalContentId)
            .OnDelete(DeleteBehavior.SetNull);

        // AccessibilityCategoryTopic
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

        // AccessibilityTheme
        modelBuilder.Entity<AccessibilityTheme>()
            .HasKey(t => t.Id);

        modelBuilder.Entity<AccessibilityTheme>()
            .HasOne(t => t.AccessibilityCategory)
            .WithMany(c => c.Themes)
            .HasForeignKey(t => t.AccessibilityCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Índices
        modelBuilder.Entity<VestibularSubject>().HasIndex(vs => vs.SubjectId);
        modelBuilder.Entity<VestibularContent>().HasIndex(vc => vc.VestibularId);
        modelBuilder.Entity<AccessibilityCategoryTopic>().HasIndex(at => at.TopicId);

        base.OnModelCreating(modelBuilder);
    }
}
