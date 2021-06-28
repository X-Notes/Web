using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Labels
{
    public class Label : BaseEntity<Guid>
    {
        public string Color { set; get; }
        public string Name { set; get; }
        public int Order { set; get; }
        public bool IsDeleted { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
        public List<LabelsNotes> LabelsNotes { get; set; }
        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
