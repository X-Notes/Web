﻿using Common.DatabaseModels.models;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.app;
using Common.DTO.labels;
using Common.DTO.notes;
using Common.DTO.notes.FullNoteContent;
using System;
using System.Collections.Generic;
using System.Linq;


namespace BI.Mapping
{
    public class NoteCustomMapper
    {
        public FullNote TranformNoteToFullNote(Note note)
        {
            var _fullNote = new FullNote()
            {
                Id = note.Id,
                Color = note.Color,
                NoteType = TranformTypeToTypeDTO(note.NoteType),
                RefType = TranformRefToRefDTO(note.RefType),
                Title = note.Title,
                Contents = TranformContentsToContentsDTO(note.Contents),
                Labels = TranformLabelsToLabelsDTO(note.LabelsNotes)
            };
            return _fullNote;
        }

        public List<BaseContentNoteDTO> TranformContentsToContentsDTO(List<BaseNoteContent> Contents)
        {
            var resultList = new List<BaseContentNoteDTO>();
            foreach(var content in Contents)
            {
                switch (content)
                {
                    case TextNote tN:
                    {
                            var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.Text);
                            var tNDTO = new TextNoteDTO(tN.Content, tN.Id, tN.Order, type);
                            resultList.Add(tNDTO);
                            break;
                    }
                    case AlbumNote aN:
                    {
                            var type = NoteContentTypeDictionary.GetValueFromDictionary(NoteContentType.Album);
                            var photosDTO = aN.Files.Select(item => new AlbumPhotoDTO(item.Id)).ToList();
                            var aNDTO = new AlbumNoteDTO(photosDTO, aN.Id, aN.Order, type);
                            resultList.Add(aNDTO);
                            break;
                    }
                    default:
                    {
                            throw new Exception("Incorrect type");
                    }
                }
            }
            return resultList;
        }

        public NoteTypeDTO TranformTypeToTypeDTO(NoteType type)
        {
            return new NoteTypeDTO(type.Id, type.Name);
        }

        public RefTypeDTO TranformRefToRefDTO(RefType type)
        {
            return new RefTypeDTO(type.Id, type.Name);
        }

        public List<LabelDTO> TranformLabelsToLabelsDTO(List<LabelsNotes> labelsNotes)
        {
            var count = labelsNotes.Count();
            return labelsNotes.Select(x => TranformLabelToLabelDTO(x, count)).ToList();
        }

        public LabelDTO TranformLabelToLabelDTO(LabelsNotes label, int count)
        {
            var lb = label.Label;
            return new LabelDTO()
            {
                Id = lb.Id,
                Name = lb.Name,
                Color = lb.Color,
                CountNotes = count,
                IsDeleted = lb.IsDeleted
            };
        }

    }
}