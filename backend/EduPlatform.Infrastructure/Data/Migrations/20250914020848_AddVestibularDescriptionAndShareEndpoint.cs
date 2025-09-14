using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EduPlatform.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVestibularDescriptionAndShareEndpoint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Vestibulares",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AccessibilityThemes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AccessibilityCategoryId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessibilityThemes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccessibilityThemes_AccessibilityCategories_AccessibilityCa~",
                        column: x => x.AccessibilityCategoryId,
                        principalTable: "AccessibilityCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccessibilityThemes_AccessibilityCategoryId",
                table: "AccessibilityThemes",
                column: "AccessibilityCategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessibilityThemes");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Vestibulares");
        }
    }
}
