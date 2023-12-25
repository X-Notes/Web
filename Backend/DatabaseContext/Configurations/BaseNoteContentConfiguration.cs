using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class BaseNoteContentConfiguration : IEntityTypeConfiguration<BaseNoteContent>
{
    public void Configure(EntityTypeBuilder<BaseNoteContent> builder)
    {
        builder
            .HasOne(x => x.Note)
            .WithMany(x => x.Contents)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(p => p.Files)
            .WithMany(p => p.BaseNoteContents)
            .UsingEntity<CollectionNoteAppFile>(
                j => j
                    .HasOne(pt => pt.AppFile)
                    .WithMany(t => t.CollectionNoteAppFiles)
                    .HasForeignKey(pt => pt.AppFileId),
                j => j
                    .HasOne(pt => pt.BaseNoteContent)
                    .WithMany(p => p.CollectionNoteAppFiles)
                    .HasForeignKey(pt => pt.BaseNoteContentId),
                j =>
                {
                    j.HasKey(bc => new { CollectionNoteId = bc.BaseNoteContentId, bc.AppFileId });
                });

        builder.Property(x => x.Version).HasDefaultValue(1);
        builder.Property(x => x.Contents).HasMaxLength(12000); // TODO doesn't work because json
        builder.Property(x => x.PlainContent).HasMaxLength(5000);
        builder.Property(x => x.Metadata).HasMaxLength(1000); // TODO doesn't work because json
    }
}