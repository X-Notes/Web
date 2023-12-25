using Common.DatabaseModels.Models.Folders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class FoldersNotesConfiguration : IEntityTypeConfiguration<FoldersNotes>
{
    public void Configure(EntityTypeBuilder<FoldersNotes> builder)
    {
        builder
            .HasKey(bc => new { bc.NoteId, bc.FolderId });

        builder
            .HasOne(bc => bc.Folder)
            .WithMany(b => b.FoldersNotes)
            .HasForeignKey(bc => bc.FolderId);

        builder
            .HasOne(bc => bc.Note)
            .WithMany(c => c.FoldersNotes)
            .HasForeignKey(bc => bc.NoteId);
    }
}