
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.models
{
    public class Label : BaseEntity
    {
        public string Color { set; get; }
        public string Name { set; get; }
        public int Order { set; get; }
        public bool IsDeleted { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
        public List<LabelsNotes> LabelsNotes { get; set; }
        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
