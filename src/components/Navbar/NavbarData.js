import * as MdIcons from "react-icons/md"
import * as AiIcons from "react-icons/ai"
import { CgFileAdd } from "react-icons/cg";
import { FaUsersGear } from "react-icons/fa6";
import { ImInsertTemplate } from "react-icons/im";
import { FiHome } from "react-icons/fi";
import { SiQuicklook } from "react-icons/si";
import { CiSettings } from "react-icons/ci";

export const NavBarData = (user) => [
  {
    id: 1,
    title: "Inicio",
    path: "/home",
    icon: <FiHome />,
    cName: "nav-text",
    description: 'Resumen ejecutivo del portal',
    type: 'native',
    version: '1.0.0',
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
    version: '1.0.0',
    active: true,
    access: ['admin', 'jefe', 'usuario']
  },
  {
    id: 7,
    title: "Administración",
    path: "/administracion",
    icon: <CiSettings />,
    cName: "nav-text",
    description: 'Administración del portal.',
    type: 'native',
    version: '1.0.0',
    active: true,
    access: ['admin']
  },
  /* {
    title: "Nuevo servicio",
    path: "/form",
    icon: <CgFileAdd />,
    cName: "nav-text",
    access: ['admin', 'usuario']
  },
  {
    title: "Tabla servicios",
    path: "/inicio",
    icon: <MdIcons.MdOutlineInventory />,
    cName: "nav-text",
    access: ['admin', 'usuario']
  },
  {
    title: "Conductores",
    path: "/drivers",
    icon: <FaUsersGear />,
    cName: "nav-text",
    access: ['admin']
  },
  {
    title: "Placas",
    path: "/plates",
    icon: <ImInsertTemplate />,
    cName: "nav-text",
    access: ['admin']
  },
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: <AiIcons.AiOutlineUser />,
    cName: "nav-text",
    access: ['admin']
  }, */
];