using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(x => x.Email).IsRequired();
        builder.HasIndex(x => new { x.Email }).IsUnique();
        builder.Property(x => x.BillingPlanId).HasDefaultValue(BillingPlanTypeENUM.Standart);

        builder
            .HasOne(x => x.CurrentBackground)
            .WithOne(q => q.CurrentUserBackground)
            .HasForeignKey<User>(h => h.CurrentBackgroundId);

        builder
            .HasOne(x => x.UserProfilePhoto)
            .WithOne(q => q.User)
            .HasForeignKey<UserProfilePhoto>(h => h.UserId);

        builder
            .HasMany(p => p.NoteHistories)
            .WithMany(p => p.Users)
            .UsingEntity<UserNoteSnapshotManyToMany>(
                j => j
                    .HasOne(pt => pt.NoteSnapshot)
                    .WithMany(t => t.UserHistories)
                    .HasForeignKey(pt => pt.NoteSnapshotId),
                j => j
                    .HasOne(pt => pt.User)
                    .WithMany(p => p.UserHistories)
                    .HasForeignKey(pt => pt.UserId),
                j =>
                {
                    j.HasKey(bc => new { bc.UserId, bc.NoteSnapshotId });
                });
    }
}