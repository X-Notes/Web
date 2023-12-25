using Common.DatabaseModels.Models.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class PersonalizationSettingConfiguration : IEntityTypeConfiguration<PersonalizationSetting>
{
    public void Configure(EntityTypeBuilder<PersonalizationSetting> builder)
    {
        builder
            .Property(b => b.NotesInFolderCount)
            .HasDefaultValue(5);

        builder
            .HasOne(x => x.SortedFolderByType)
            .WithMany(x => x.PersonalizationSettingsFolders)
            .HasForeignKey(x => x.SortedFolderByTypeId);

        builder
            .HasOne(x => x.SortedNoteByType)
            .WithMany(x => x.PersonalizationSettingsNotes)
            .HasForeignKey(x => x.SortedNoteByTypeId);
    }
}