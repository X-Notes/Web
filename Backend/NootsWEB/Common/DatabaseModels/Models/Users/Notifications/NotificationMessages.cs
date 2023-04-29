using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Users.Notifications;

[Table(nameof(NotificationMessages), Schema = SchemeConfig.User)]
public class NotificationMessages: BaseEntity<NotificationMessagesEnum>
{
    public string MessageKey { set; get; }

    public List<Notification> Notifications { set; get; }
}
