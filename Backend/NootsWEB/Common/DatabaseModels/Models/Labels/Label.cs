using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Users;
using Common.Interfaces;

namespace Common.DatabaseModels.Models.Labels
{
    [Table(nameof(Label), Schema = SchemeConfig.Label)]
    public class Label : BaseEntity<Guid>, IDateCreator, IDateUpdater, IDateDeleter
    {
        public string Color { set; get; }

        public string Name { set; get; }

        public int Order { set; get; }

        public bool IsDeleted { set; get; }

        public Guid UserId { set; get; }

        public User User { set; get; }

        public List<LabelsNotes> LabelsNotes { get; set; }

        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public void ToType(bool isDeleted, DateTimeOffset? deletedAt = null)
        {
            DeletedAt = deletedAt;
            IsDeleted = isDeleted;
            UpdatedAt = DateTimeProvider.Time;
        }
    }
}
