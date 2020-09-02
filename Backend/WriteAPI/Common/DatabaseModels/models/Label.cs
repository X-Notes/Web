
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.models
{
    public class Label
    {
        public int Id { set; get; }
        public string Color { set; get; }
        public string Name { set; get; }
        public int Order { set; get; }
        public bool IsDeleted { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
        public List<LabelsNotes> LabelsNotes { get; set; }
        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
