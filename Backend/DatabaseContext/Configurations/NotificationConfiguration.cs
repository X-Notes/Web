using Common.DatabaseModels.Models.Users.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DatabaseContext.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder
            .HasOne(m => m.UserFrom)
            .WithMany(t => t.NotificationsFrom)
            .HasForeignKey(m => m.UserFromId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(m => m.UserTo)
            .WithMany(t => t.NotificationsTo)
            .HasForeignKey(m => m.UserToId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.NotificationMessagesId).HasDefaultValue(NotificationMessagesEnum.SentInvitesToNoteV1);
    }
}