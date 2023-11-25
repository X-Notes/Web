using Common.Interfaces;
using System;

namespace Common.DTO.Labels
{
    public class LabelDTO : IDateCreator, IDateUpdater, IDateDeleter
    {
        public Guid Id { set; get; }

        public string Name { set; get; }

        public bool IsDeleted { set; get; }

        public string Color { set; get; }

        public int CountNotes { set; get; }

        public int Order { set; get; }

        public DateTimeOffset? DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
