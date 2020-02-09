using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.Mongo.Parts
{
   // [BsonDiscriminator(RootClass = true)]
    //[BsonKnownTypes(typeof(Text), typeof(CommonList))]
    public class Part
    {
        public ObjectId Id { set; get; }
        public string Type { set; get; }
        public int Order { set; get; }
    }
}
