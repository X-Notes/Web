using Common.DatabaseModels.Models.Labels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class LabelsNotesConfiguration : IEntityTypeConfiguration<LabelsNotes>
{
    public void Configure(EntityTypeBuilder<LabelsNotes> builder)
    {
        builder
            .HasKey(bc => new { bc.NoteId, bc.LabelId });

        builder
            .HasOne(bc => bc.Label)
            .WithMany(b => b.LabelsNotes)
            .HasForeignKey(bc => bc.LabelId);

        builder
            .HasOne(bc => bc.Note)
            .WithMany(c => c.LabelsNotes)
            .HasForeignKey(bc => bc.NoteId);
    }
}