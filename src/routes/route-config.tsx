import { createBrowserRouter } from "react-router-dom";

// Componentes públicos
import HomePage from "@/view/public/Home";
import Login from "@/view/public/Login";
import ChangePassword from "@/view/public/ChangePassword";

// Componentes del dashboard
// Este es el nuevo componente que creamos
import Page from "@/view/dashboard";
import ListStudent from "@/view/private/ListStudent";
import ListTeacher from "@/view/private/ListTeacher";
import RegsiterStudent from "@/view/private/RegisterStudent";
import RegisterTeacher from "@/view/private/RegisterTeacher";
import StudentPromotions from "@/view/private/StudentPromotions";
import ProtectedRoute from "./ProtectedRoute";

import TeacherDashboard from "@/view/private/teacher/teacherDashboard";
import CuotasProgramar from "@/view/private/teacher/CuotasProgramar";
import HistorialAsistencia from "@/view/private/teacher/HistorialAsistencia";
import VisionMision from "@/view/public/VisionMision";
import Body from "@/view/public/body";
import Contact from "@/view/public/Contact";
import Admision from "@/view/public/Admision";
import Valores from "@/view/public/Valores";
import Pilares from "@/view/public/Pilares";
import Infraestructura from "@/view/public/Infraestructura";
import Comunidad from "@/view/public/Comunidad";

import Bienvenida from "@/view/public/Bienvenida";
import EarlyYears from "@/view/public/EarlyYears";
import Idiomas from "@/view/public/Idiomas";
import Tecnologia from "@/view/public/Tecnologia";
import Deporte from "@/view/public/Deporte";
import ArteCultura from "@/view/public/ArteCultura";
import ExcelenciaAcademica from "@/view/public/ExcelenciaAcademica";

import CuotasDetalle from "@/view/private/CuotasDetalle";
import DashboardHome from "@/view/private/DashboardHome";

import JustificacionesDocente from "@/view/private/teacher/JustificacionesDocente";
import DirectorReporteAsistencia from "@/view/private/teacher/ReporteAsistenciaClases";
import AsistenciaBloquesDocente from "@/view/private/teacher/AsistenciaBloquesDocente";
import ReporteAsistenciaBloques from "@/view/private/teacher/ReporteAsistenciaBloques";
import ScheduleAssignment from "@/view/private/ScheduleAssignment";
import ScheduleGrid from "@/view/private/ScheduleGrid";
import TeacherHome from "@/view/private/teacher/TeacherHome";
import MySchedule from "@/view/private/teacher/MySchedule";

// Componente para protección de rutas

const router = createBrowserRouter([
  // Ruta pública con hijos
  {
    path: "/",
    element: <HomePage />,
    children: [
      { path: "login", element: <Login /> },
      { path: "vision-mision", element: <VisionMision /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "contacto", element: <Contact /> },
      { path: "admision", element: <Admision /> },
      { path: "valores", element: <Valores /> },
      { path: "pilares", element: <Pilares /> },
      { path: "espacio", element: <Infraestructura /> },
      { path: "bienvenida", element: <Bienvenida /> },
      { path: "comunidad", element: <Comunidad /> },
      { path: "inicial", element: <EarlyYears /> },
      { path: "excelencia", element: <ExcelenciaAcademica /> },
      { path: "idiomas", element: <Idiomas /> },
      { path: "tecnologia", element: <Tecnologia /> },
      { path: "deporte", element: <Deporte /> },
      { path: "arte", element: <ArteCultura /> },


      { path: "/", element: <Body /> },
    ],
  },

  // Ruta protegida del dashboard (la protección aplica a todas las hijas)
  {
    path: "/dashboard/",
    element: (
      <ProtectedRoute allowedRoles={[1, 2]}>
        <Page /> {/* Este es tu layout del dashboard */}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> }, // Página por defecto del dashboard
      { path: "register-student", element: <RegsiterStudent /> },
      { path: "list-student", element: <ListStudent /> },
      { path: "register-teacher", element: <RegisterTeacher /> },
      { path: "list-teacher", element: <ListTeacher /> },
      { path: "programar-cuotas", element: <CuotasProgramar /> },
      { path: "cuotas-detalle", element: <CuotasDetalle /> },
      { path: "promocion-alumnos", element: <StudentPromotions /> },
      { path: "asignar-horarios", element: <ScheduleAssignment /> },
      { path: "ver-horarios", element: <ScheduleGrid /> },
      { path: "reporte-asistencia", element: <DirectorReporteAsistencia /> },

    ],
  },
  {
    path: "/teacher/",
    element: (
      <ProtectedRoute allowedRoles={[2]}>
        <TeacherDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TeacherHome /> },
      { path: "registrar-asistencia", element: <AsistenciaBloquesDocente /> },
      { path: "ver-asistencia", element: <HistorialAsistencia /> },
      { path: "justificaciones", element: <JustificacionesDocente /> },
      { path: "reportes-bloques", element: <ReporteAsistenciaBloques /> },
      { path: "mi-horario", element: <MySchedule /> },
    ],
    // children: [{ path: "list-teacher", element: <ListTeacher /> }],
  },
]);

export default router;
