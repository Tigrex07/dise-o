// MaquinistaAssignmentDto.cs
using MachineShopApi.DTOs;
using System;
using System.ComponentModel.DataAnnotations;

public class MaquinistaAssignmentDto
{
    public int IdSolicitud { get; set; }
    public string MaquinistaAsignadoNombre { get; set; }
}