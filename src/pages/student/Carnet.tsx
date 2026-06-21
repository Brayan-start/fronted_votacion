import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { voteService } from '../../services/voteService';
import { CarnetData } from '../../types';
import {
  IdCard, Download, AlertCircle, RefreshCcw, CheckCircle2, Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const Carnet: React.FC = () => {
  const [data, setData] = useState<CarnetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const carnetData = await voteService.getCarnetData();
      setData(carnetData);
    } catch {
      setError('No se pudo obtener los datos para el carnet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const generatePDF = async () => {
    if (!data) return;
    setGenerating(true);

    try {
      const pdf = new jsPDF('landscape', 'mm', 'a5');
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();

      const margin = 6;
      const contentW = w - margin * 2;
      const contentH = h - margin * 2;

      // ── Fondo completamente blanco ──────────────────────────────────
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, w, h, 'F');

      // Borde exterior del carnet (fino, azul oscuro)
      pdf.setDrawColor(25, 35, 65);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(margin, margin, contentW, contentH, 3, 3, 'S');

      // Borde interior decorativo
      pdf.setDrawColor(200, 210, 230);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin + 2, margin + 2, contentW - 4, contentH - 4, 2, 2, 'S');

      // ── Encabezado institucional ─────────────────────────────────────
      const headerY = margin + 5;
      const headerH = 26;

      pdf.setFillColor(25, 35, 65);
      pdf.roundedRect(margin + 2, headerY, contentW - 4, headerH, 1.5, 1.5, 'F');

      // Franja decorativa superior del header
      pdf.setFillColor(200, 170, 60);
      pdf.rect(margin + 2, headerY, contentW - 4, 2.5, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('UNIVERSIDAD PUBLICA DE EL ALTO', w / 2, headerY + 8.5, { align: 'center' });

      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('INGENIERIA DE SISTEMAS', w / 2, headerY + 14, { align: 'center' });

      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CARNET DE SUFRAGIO', w / 2, headerY + 20, { align: 'center' });

      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text('ELECCIONES DE CENTRO DE ESTUDIANTES', w / 2, headerY + 24.5, { align: 'center' });

      // ── Línea divisoria ──────────────────────────────────────────────
      const dividerY = headerY + headerH + 2;
      pdf.setDrawColor(200, 210, 230);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 6, dividerY, w - margin - 6, dividerY);

      // ── Zona de foto ─────────────────────────────────────────────────
      const photoX = margin + 6;
      const photoY = dividerY + 4;
      const photoW = 42;
      const photoH = 52;

      // Marco para la foto
      pdf.setDrawColor(25, 35, 65);
      pdf.setLineWidth(0.5);
      pdf.rect(photoX, photoY, photoW, photoH, 'S');

      // Cargar foto real si existe
      if (data.photo_url) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = data.photo_url;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            pdf.addImage(photoDataUrl, 'JPEG', photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
          }
        } catch {
          // Fallback: iniciales sobre fondo gris claro
          pdf.setFillColor(240, 240, 245);
          pdf.rect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1, 'F');
          pdf.setTextColor(100, 110, 130);
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          const initials = `${data.name[0]}${data.last_name[0]}`;
          pdf.text(initials, photoX + photoW / 2, photoY + photoH / 2 + 6, { align: 'center' });
        }
      } else {
        pdf.setFillColor(240, 240, 245);
        pdf.rect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1, 'F');
        pdf.setTextColor(100, 110, 130);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        const initials = `${data.name[0]}${data.last_name[0]}`;
        pdf.text(initials, photoX + photoW / 2, photoY + photoH / 2 + 6, { align: 'center' });
      }

      // ── Datos del votante ────────────────────────────────────────────
      const labelW = 22;
      const valueStartX = photoX + photoW + 8;
      const labelX = valueStartX;
      const fieldValueX = valueStartX + labelW;
      let fieldY = photoY + 3;
      const fieldLineH = 7;

      pdf.setTextColor(80, 90, 110);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');

      const fields = [
        { label: 'NOMBRES:', value: `${data.name} ${data.last_name}` },
        { label: 'APELLIDOS:', value: `${data.last_name}` },
        { label: 'C.I.:', value: data.id_card },
        { label: 'R.U.:', value: data.reg_univ },
        { label: 'CARRERA:', value: data.carrera || 'No especificada' },
        { label: 'N° MESA:', value: data.mesa },
        { label: 'GESTION:', value: data.gestion },
        { label: 'EMISION:', value: data.fecha_emision },
      ];

      // Línea de fondo alternada para los campos
      fields.forEach((f, i) => {
        if (i % 2 === 0) {
          pdf.setFillColor(248, 249, 252);
          pdf.rect(valueStartX, fieldY - 2, w - valueStartX - margin - 4, fieldLineH, 'F');
        }
        pdf.setTextColor(80, 90, 110);
        pdf.setFont('helvetica', 'bold');
        pdf.text(f.label, labelX, fieldY + 2.5);
        pdf.setTextColor(30, 40, 60);
        pdf.setFont('helvetica', 'normal');
        pdf.text(f.value, fieldValueX + 2, fieldY + 2.5);
        fieldY += fieldLineH;
      });

      // ── Fecha de emisión explícita también abajo ─────────────────────
      pdf.setTextColor(120, 130, 150);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'normal');
      const bottomDataY = photoY + photoH + 3;
      pdf.text(`Fecha de emision: ${data.fecha_emision}`, photoX, bottomDataY);

      // ── Gestión electoral ────────────────────────────────────────────
      pdf.setTextColor(25, 35, 65);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`GESTION ELECTORAL ${data.gestion}`, photoX, bottomDataY + 5);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120, 130, 150);
      pdf.text('COMITE ELECTORAL', photoX, bottomDataY + 9);

      // ── QR y Código de Verificación ──────────────────────────────────
      const qrSize = 36;
      const qrX = w - margin - 6 - qrSize;
      const qrY = headerY + headerH + 4;

      // Marco para el QR
      pdf.setDrawColor(25, 35, 65);
      pdf.setLineWidth(0.4);
      pdf.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 'S');

      // Generar QR con la URL de verificación pública
      const verificationUrl = `${window.location.origin}/verify-carnet?code=${data.codigo_verificacion}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 120,
        margin: 1,
        color: { dark: '#1a2332', light: '#ffffff' },
      });
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      // Etiqueta del QR
      pdf.setTextColor(25, 35, 65);
      pdf.setFontSize(5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CODIGO DE VERIFICACION', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });

      pdf.setTextColor(60, 70, 90);
      pdf.setFontSize(4.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.codigo_verificacion, qrX + qrSize / 2, qrY + qrSize + 8.5, { align: 'center' });

      // ── Sello / Firma digital del Comité Electoral ───────────────────
      const sealY = h - margin - 16;
      const sealW = 55;
      const sealH = 14;
      const sealX = margin + 6;

      pdf.setDrawColor(100, 110, 130);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(sealX, sealY, sealW, sealH, 1.5, 1.5, 'S');

      // Línea decorativa dentro del sello
      pdf.setDrawColor(200, 210, 230);
      pdf.setLineWidth(0.2);
      pdf.line(sealX + 3, sealY + 5, sealX + sealW - 3, sealY + 5);

      pdf.setTextColor(60, 70, 90);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COMITE ELECTORAL', sealX + sealW / 2, sealY + 4, { align: 'center' });
      pdf.setFontSize(4.5);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(130, 140, 160);
      pdf.text('Firma Digital / Sello', sealX + sealW / 2, sealY + 11, { align: 'center' });

      // ── Footer ───────────────────────────────────────────────────────
      pdf.setFillColor(25, 35, 65);
      pdf.rect(margin + 2, h - margin - 4, contentW - 4, 4, 'F');

      pdf.setTextColor(200, 210, 230);
      pdf.setFontSize(5);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        'Documento generado electronicamente - Valido para fines electorales universitarios',
        w / 2,
        h - margin - 1.5,
        { align: 'center' }
      );

      // ── Descargar ────────────────────────────────────────────────────
      pdf.save(`carnet_sufragio_${data.reg_univ}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-3">
          <IdCard size={28} className="text-blue-400" />
          Carnet de Sufragio
        </h1>
        <p className="text-sm font-medium text-[var(--text-tertiary)] mt-1">
          Genera y descarga tu carnet de sufragio universitario en formato PDF.
        </p>
      </div>

      {loading ? (
        <Card className="border-[var(--border-color)]">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-blue-400 animate-spin" />
              <p className="text-[var(--text-tertiary)] font-medium">Cargando datos del carnet...</p>
            </div>
          </div>
        </Card>
      ) : error && !data ? (
        <div className="text-center py-20 bg-red-500/10 backdrop-blur-sm rounded-[2rem] border border-dashed border-red-500/20">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <p className="text-[var(--accent-red)] font-medium mb-4">{error}</p>
          <Button variant="primary" onClick={fetchData}>
            <RefreshCcw size={16} /> Reintentar
          </Button>
        </div>
      ) : data ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-[var(--border-color)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)]">Datos verificados</h2>
                  <p className="text-xs text-[var(--text-tertiary)] font-medium">
                    Tu carnet está listo para descargar.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-3.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Estudiante</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{data.name} {data.last_name}</p>
                </div>
                <div className="p-3.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">C.I.</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{data.id_card}</p>
                </div>
                <div className="p-3.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">R.U.</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{data.reg_univ}</p>
                </div>
                <div className="p-3.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">N° Mesa</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{data.mesa}</p>
                </div>
                <div className="p-3.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Gestión</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{data.gestion}</p>
                </div>
                <div className="p-3.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Emisión</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{data.fecha_emision}</p>
                </div>
                <div className="p-3.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)] sm:col-span-2">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Código de verificación</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 font-mono tracking-wider">{data.codigo_verificacion}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  loading={generating}
                  onClick={generatePDF}
                  className="rounded-2xl px-10"
                >
                  {generating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Descargar Carnet PDF
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      ) : null}
    </div>
  );
};

export default Carnet;
