using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Mongo
{
    public class Labels
    {
        public ObjectId Id { get; set; }
        public ObjectId UserId { get; set; }
        public List<Label> ListLabels { get; set; }
    }
}
