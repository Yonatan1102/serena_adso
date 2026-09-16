import React, { useState } from 'react';
import {
  X,
  Code2,
  Database,
  Layers,
  Copy,
  Check,
  Server,
  FileCode,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface BackendIntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendIntegrationGuideModal: React.FC<BackendIntegrationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<'efcore' | 'angular' | 'sql' | 'arquitectura'>('efcore');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const efCode = `// ==========================================
// SERENA - ASP.NET Core Web API + EF Core
// Data/SerenaDbContext.cs
// ==========================================
using Microsoft.EntityFrameworkCore;

namespace Serena.Api.Data
{
    public class SerenaDbContext : DbContext
    {
        public SerenaDbContext(DbContextOptions<SerenaDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Rol> Roles { get; set; }
        public DbSet<EstadoDeAnimo> EstadosDeAnimo { get; set; }
        public DbSet<Diario> Diarios { get; set; }
        public DbSet<Cita> Citas { get; set; }
        public DbSet<HistorialCita> HistorialCitas { get; set; }
        public DbSet<HistoriaClinica> HistoriasClinicas { get; set; }
        public DbSet<Publicacion> Publicaciones { get; set; }
        public DbSet<Comunidad> Comunidades { get; set; }
        public DbSet<Formulario> Formularios { get; set; }
        public DbSet<Emergencia> Emergencias { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // RN-01: Confidencialidad historia clínica
            modelBuilder.Entity<HistoriaClinica>()
                .HasOne(h => h.Aprendiz)
                .WithOne()
                .HasForeignKey<HistoriaClinica>(h => h.IdUsuarioAprendiz)
                .OnDelete(DeleteBehavior.Restrict);

            // RN-04: Trazabilidad inmutable de citas
            modelBuilder.Entity<HistorialCita>()
                .HasOne(h => h.Cita)
                .WithMany(c => c.Historiales)
                .HasForeignKey(h => h.IdCita);
        }
    }
}`;

  const angularCode = `// ==========================================
// SERENA - Angular Service (Injectable)
// src/app/services/serena-api.service.ts
// ==========================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, EstadoDeAnimo, Cita, Publicacion } from '../models/serena.models';

@Injectable({
  providedIn: 'root'
})
export class SerenaApiService {
  private readonly baseUrl = 'https://localhost:5001/api';

  constructor(private http: HttpClient) {}

  // RF-EA-01: Registrar estado de ánimo
  registrarEstadoDeAnimo(dto: any): Observable<EstadoDeAnimo> {
    return this.http.post<EstadoDeAnimo>(\`\${this.baseUrl}/estado-animo\`, dto);
  }

  // RF-EA-02: Obtener historial
  getHistorialEstados(idUsuario: number): Observable<EstadoDeAnimo[]> {
    return this.http.get<EstadoDeAnimo[]>(\`\${this.baseUrl}/estado-animo/usuario/\${idUsuario}\`);
  }

  // RF-CIT-01: Agendar cita
  agendarCita(dto: any): Observable<Cita> {
    return this.http.post<Cita>(\`\${this.baseUrl}/citas\`, dto);
  }

  // RF-PUB-01: Publicaciones por comunidad
  getPublicacionesPorComunidad(comunidadId: string): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(\`\${this.baseUrl}/publicaciones/comunidad/\${comunidadId}\`);
  }
}`;

  const sqlSchema = `-- Tablas relacionales SERENA (SQL Server / PostgreSQL)
CREATE TABLE roles (
    id_rol INT PRIMARY KEY IDENTITY(1,1),
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY IDENTITY(1,1),
    nombre_usuario VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL FOREIGN KEY REFERENCES roles(id_rol),
    centro VARCHAR(50) NOT NULL, -- CMTC, CMM, CEET
    documento VARCHAR(50),
    ficha VARCHAR(50),
    especialidad VARCHAR(100)
);

CREATE TABLE estado_de_animo (
    id_estado INT PRIMARY KEY IDENTITY(1,1),
    id_usuario INT NOT NULL FOREIGN KEY REFERENCES usuarios(id_usuario),
    nombre_estado VARCHAR(50) NOT NULL,
    centro VARCHAR(50) NOT NULL,
    avatar_path VARCHAR(255) NOT NULL,
    nota TEXT,
    intensidad INT DEFAULT 3,
    fecha_estado DATETIME DEFAULT GETDATE()
);

-- Demás tablas: diario, citas, historial_cita, historia_clinica, publicaciones, comunidades, formularios, emergencias...`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Guía de Arquitectura: C# EF Core & Código Angular
              </h3>
              <p className="text-xs text-slate-500">
                Estructura lista para conectar al Backend .NET y código TypeScript para Angular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-100 pb-2">
          <button
            onClick={() => setTab('efcore')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              tab === 'efcore'
                ? 'bg-purple-100 text-purple-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>C# EF Core (DbContext)</span>
          </button>

          <button
            onClick={() => setTab('angular')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              tab === 'angular'
                ? 'bg-red-100 text-red-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Código Angular (Service)</span>
          </button>

          <button
            onClick={() => setTab('sql')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              tab === 'sql'
                ? 'bg-blue-100 text-blue-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Esquema SQL (11 Tablas)</span>
          </button>

          <button
            onClick={() => setTab('arquitectura')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              tab === 'arquitectura'
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Reglas de Negocio (RN)</span>
          </button>
        </div>

        {/* Contenido de pestaña */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {tab === 'efcore' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Mapeo C# Entity Framework Core según SRS:
                </span>
                <button
                  onClick={() => handleCopy(efCode)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado' : 'Copiar C#'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
                {efCode}
              </pre>
            </div>
          )}

          {tab === 'angular' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Código de Servicio Angular equivalente listo para CLI:
                </span>
                <button
                  onClick={() => handleCopy(angularCode)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado' : 'Copiar TS Angular'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
                {angularCode}
              </pre>
            </div>
          )}

          {tab === 'sql' && (
            <div>
              <pre className="bg-slate-950 text-sky-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
                {sqlSchema}
              </pre>
            </div>
          )}

          {tab === 'arquitectura' && (
            <div className="flex flex-col gap-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-1">RN-01: Confidencialidad de Historia Clínica</h4>
                <p>Solo un usuario con id_rol = 2 (Psicólogo) o id_rol = 3 (Admin) puede consultar y editar historias clínicas.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-1">RN-02: Propiedad y Cifrado de Diario</h4>
                <p>El aprendiz es dueño absoluto de sus escritos. Si compartir_sp = 0, nadie más tiene acceso a sus datos.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-1">RN-04: Trazabilidad Inmutable de Citas</h4>
                <p>Cada transición de estado genera un registro en historial_cita con timestamp y responsable.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <h4 className="font-bold text-rose-900 mb-1">RN-05: Bitácora de Emergencias</h4>
                <p>Toda activación del botón de emergencia se audita permanentemente para seguimiento de bienestar.</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
