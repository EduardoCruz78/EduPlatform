using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EduPlatform.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVestibularAndAccessibility : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subjects_Vestibulares_VestibularId",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_VestibularId",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "VestibularId",
                table: "Subjects");

            migrationBuilder.AddColumn<string>(
                name: "Date",
                table: "Vestibulares",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Url",
                table: "Vestibulares",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AccessibilityCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessibilityCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VestibularContents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: true),
                    Link = table.Column<string>(type: "text", nullable: true),
                    PdfUrl = table.Column<string>(type: "text", nullable: true),
                    OriginalContentId = table.Column<int>(type: "integer", nullable: true),
                    OriginalTopicId = table.Column<int>(type: "integer", nullable: true),
                    VestibularId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VestibularContents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VestibularContents_Contents_OriginalContentId",
                        column: x => x.OriginalContentId,
                        principalTable: "Contents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_VestibularContents_Vestibulares_VestibularId",
                        column: x => x.VestibularId,
                        principalTable: "Vestibulares",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VestibularSubjects",
                columns: table => new
                {
                    VestibularId = table.Column<int>(type: "integer", nullable: false),
                    SubjectId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VestibularSubjects", x => new { x.VestibularId, x.SubjectId });
                    table.ForeignKey(
                        name: "FK_VestibularSubjects_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VestibularSubjects_Vestibulares_VestibularId",
                        column: x => x.VestibularId,
                        principalTable: "Vestibulares",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AccessibilityCategoryTopics",
                columns: table => new
                {
                    AccessibilityCategoryId = table.Column<int>(type: "integer", nullable: false),
                    TopicId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessibilityCategoryTopics", x => new { x.AccessibilityCategoryId, x.TopicId });
                    table.ForeignKey(
                        name: "FK_AccessibilityCategoryTopics_AccessibilityCategories_Accessi~",
                        column: x => x.AccessibilityCategoryId,
                        principalTable: "AccessibilityCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AccessibilityCategoryTopics_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccessibilityCategoryTopics_TopicId",
                table: "AccessibilityCategoryTopics",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_VestibularContents_OriginalContentId",
                table: "VestibularContents",
                column: "OriginalContentId");

            migrationBuilder.CreateIndex(
                name: "IX_VestibularContents_VestibularId",
                table: "VestibularContents",
                column: "VestibularId");

            migrationBuilder.CreateIndex(
                name: "IX_VestibularSubjects_SubjectId",
                table: "VestibularSubjects",
                column: "SubjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessibilityCategoryTopics");

            migrationBuilder.DropTable(
                name: "VestibularContents");

            migrationBuilder.DropTable(
                name: "VestibularSubjects");

            migrationBuilder.DropTable(
                name: "AccessibilityCategories");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Vestibulares");

            migrationBuilder.DropColumn(
                name: "Url",
                table: "Vestibulares");

            migrationBuilder.AddColumn<int>(
                name: "VestibularId",
                table: "Subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_VestibularId",
                table: "Subjects",
                column: "VestibularId");

            migrationBuilder.AddForeignKey(
                name: "FK_Subjects_Vestibulares_VestibularId",
                table: "Subjects",
                column: "VestibularId",
                principalTable: "Vestibulares",
                principalColumn: "Id");
        }
    }
}
