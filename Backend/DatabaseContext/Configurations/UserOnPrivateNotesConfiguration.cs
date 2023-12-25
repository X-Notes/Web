using Common.DatabaseModels.Models.Notes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class UserOnPrivateNotesConfiguration : IEntityTypeConfiguration<UserOnPrivateNotes>
{
    public void Configure(EntityTypeBuilder<UserOnPrivateNotes> builder)
    {
        builder.HasKey(bc => new { bc.NoteId, bc.UserId });

        builder
            .HasOne(bc => bc.Note)
            .WithMany(b => b.UsersOnPrivateNotes)
            .HasForeignKey(bc => bc.NoteId);

        builder
            .HasOne(bc => bc.User)
            .WithMany(b => b.UserOnPrivateNotes)
            .HasForeignKey(bc => bc.UserId);
    }
}