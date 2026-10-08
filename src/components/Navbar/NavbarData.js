import * as MdIcons from "react-icons/md"
import * as AiIcons from "react-icons/ai"
import { CgFileAdd } from "react-icons/cg";
import { FaUsersGear } from "react-icons/fa6";
import { ImInsertTemplate } from "react-icons/im";
import { FiHome } from "react-icons/fi";
import { SiQuicklook } from "react-icons/si";
import { CiSettings } from "react-icons/ci";
import { PiStudentBold } from "react-icons/pi";
import { GoGraph } from "react-icons/go";
import { MdOutlineSecurity } from "react-icons/md";
import { TbGpsFilled } from "react-icons/tb";
import { FaMagnifyingGlass } from "react-icons/fa6";

export const NavBarData = (user) => [
  {
    id: 1,
    title: "Inicio",
    path: "/home",
    icon: <FiHome />,
    cName: "nav-text",
    description: 'Resumen ejecutivo del portal',
    type: 'native',
    version: '1.1.0',
    active: true,
    access: ['admin', 'jefe', 'usuario']
  },
  {
    id: 2,
    title: "Inspecciones",
    path: '/admin/pre/operational',
    icon: <SiQuicklook />,
    cName: "nav-text",
    description: 'Formulario Pre Operacional',
    type: 'native',
    version: '1.1.0',
    active: true,
    access: ['admin', 'jefe', 'usuario']
  },
  {
    id: 3,
    title: "PESV",
    path: '/pesv',
    icon: <MdOutlineSecurity />,
    cName: "nav-text",
    description: 'Plan Estratégico de Seguridad Vial',
    type: 'native',
    version: '1.0.0',
    active: true,
    access: ['admin']
  },
  {
    id: 4,
    title: "GPS",
    path: '/gps',
    icon: <TbGpsFilled />,
    cName: "nav-text",
    description: 'Información en tiempo real',
    type: 'native',
    version: '0.0.0',
    active: true,
    access: ['admin']
  },
  {
    id: 5,
    title: "Mantenimiento",
    path: '/mantenimiento',
    icon: <FaMagnifyingGlass />,
    cName: "nav-text",
    description: 'Supervisión Vehicular',
    type: 'native',
    version: '0.0.0',
    active: true,
    access: ['admin']
  },
  {
    id: 6,
    title: "Educación",
    path: '/educacion',
    icon: <PiStudentBold />,
    cName: "nav-text",
    description: 'Sesión de aprendizaje',
    type: 'native',
    version: '0.0.0',
    active: true,
    access: ['admin']
  },
  {
    id: 7,
    title: "Indicadores",
    path: '/indicadores',
    icon: <GoGraph />,
    cName: "nav-text",
    description: 'Interpretación de la información',
    type: 'native',
    version: '0.0.0',
    active: true,
    access: ['admin']
  },
  {
    id: 8,
    title: "Administración",
    path: "/administracion",
    icon: <CiSettings />,
    cName: "nav-text",
    description: 'Administración del portal',
    type: 'native',
    version: '1.1.0',
    active: true,
    access: ['admin', 'jefe']
  },
];