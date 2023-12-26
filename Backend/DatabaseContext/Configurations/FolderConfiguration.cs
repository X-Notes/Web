using Common.DatabaseModels.Models.Folders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class FolderConfiguration : IEntityTypeConfiguration<Folder>
{
    public void Configure(EntityTypeBuilder<Folder> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.SequenceId).ValueGeneratedOnAdd();
        builder.Property(x => x.Version).HasDefaultValue(1);
        builder.Property(x => x.Title).HasMaxLength(500);
    }
}