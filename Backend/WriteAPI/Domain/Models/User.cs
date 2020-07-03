using Domain.Aggregates;
using Domain.Commands;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Domain.Models
{
    public class User : AggregateBase
    {
        public string Name { private set; get; }
        public string Email { private set; get; }
        public string PhotoId { private set; get; }
        public string BackgroundId { private set; get; }
        public Language Language { private set; get; }

        public User()
        {

        }
        public void UpdateMainInfo(UpdateMainUserInfo @event)
        {
            // Call Apply to mutate state of aggregate based on event
            Apply(@event);

            // Add the event to uncommitted events to use it while persisting the events to Marten events store
            Append(@event);
        }
        public void Create(string name, string email, Language language, Guid id)
        {
            var @event = new NewUser()
            {
                Language = language,
                Email = email,
                Name = name,
            };
            // Call Apply to mutate state of aggregate based on event
            Apply(@event, id);

            // Add the event to uncommitted events to use it while persisting the events to Marten events store
            Append(@event);
        }
        public void Apply(NewUser @event, Guid id)
        {
            Id = id;
            Name = @event.Name;
            Email = @event.Email;
            PhotoId = @event.PhotoId;
            Language = @event.Language;

            //++Version;
        }

        public void Apply(UpdateMainUserInfo @event)
        {
            Name = @event.Name;

            ++Version;
        }
    }
}
