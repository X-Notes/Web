using Bogus;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FakeData;

public class NoteGenerator
{
    private readonly Faker<Note> faker = new Faker<Note>();


    public NoteGenerator(Guid userId)
    {
        faker
            .RuleFor(u => u.Title, (f, y) => f.Lorem.Text())
            .RuleFor(u => u.Color, "#FFD1D0")
            .RuleFor(u => u.NoteTypeId, NoteTypeENUM.Private)
            .RuleFor(u => u.RefTypeId, RefTypeENUM.Editor)

            .RuleFor(u => u.UserId, userId)
            .RuleFor(u => u.CreatedAt, DateTimeOffset.UtcNow)
            .RuleFor(u => u.UpdatedAt, DateTimeOffset.UtcNow);
    }

    public List<Note> GetNotes(int count)
    {
        return Enumerable.Range(0, count).Select(x => faker.Generate()).ToList();
    }
}
