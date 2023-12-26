using Common.DatabaseModels.Models.Notes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.SequenceId).ValueGeneratedOnAdd();
        builder.Property(x => x.Version).HasDefaultValue(1);
        builder.Property(x => x.Title).HasMaxLength(500);
    }
}