using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Mongo
{
    public class Label
    {
        public ObjectId Id { set; get; }
        public string Name { set; get; }
        public string Color { set; get; }
    }
}
