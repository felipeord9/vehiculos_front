import * as FiIcons from 'react-icons/fi';
import DataTable from 'react-data-table-component'
import useAlert from '../../hooks/useAlert';
import { useContext } from 'react';
import useUser from '../../hooks/useUser';
import AuthContext from '../../context/authContext';

export default function TableUsers({ users, loading, setSelectedUser, setShowModal }) {
  const { successAlert } = useAlert()
  const { user } = useContext(AuthContext);
  const { isLogged, logout } = useUser();

  const columns = [
    {
      id: "id",
      name: "Id.",
      selector: (row) => row.rowId,
      sortable: true,
      width: '150px'
    },
    {
      id: "name",
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
      width: 'auto'
    },
    {
      id: "username",
      name: "Usuario",
      selector: (row) => row.username,
      sortable: true,
      width: 'auto'
    },
    {
      id: "role",
      name: "Rol",
      selector: (row) => row.role.toUpperCase(),
      sortable: true,
      width: 'auto'
    },
    {
      id: "C.O.",
      name: "C.O.",
      selector: (row) => row.co,
      sortable: true,
      width: 'auto'
    },
    {
      id: "options",
      name: "Acciones",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          {(user.role === 'admin' && row.username !== 'admin') &&
            <button title="Editar usuario" className='btn btn-sm btn-primary' onClick={(e) => {
              setSelectedUser(row)
              setShowModal(true)
            }}>
              <FiIcons.FiEdit />
            </button>
          }
        </div>
      ),
      width: '150px'
    },
  ]

  const customStyles = {
    rows: {
      style: {
        height:'15px', // ajusta el alto de las filas según tus necesidades
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        height:'35px',
        color:'white',
        backgroundColor:'#007bff',
        paddingLeft:10,
        paddingRight:10
      },
    },
    cells: {
      style: {
        paddingLeft:10,
        paddingRight:10
      },
    },
    columns:{
      style: {
        borderLeft:'5px black solid'
      }
    }
  };
  
  return (
    <div
      className="d-flex flex-column rounded w-100"
      style={{ height: "50vh" }}
    >
      <DataTable
        className="bg-light text-center border border-2 h-100"
        columns={columns}
        data={users}
        customStyles={customStyles}
        fixedHeaderScrollHeight={200}
        progressPending={loading}
        progressComponent={
          <div class="d-flex align-items-center text-danger gap-2 mt-2">
            <strong>Cargando...</strong>
            <div
              class="spinner-border spinner-border-sm ms-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        }
        dense
        striped
        fixedHeader
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
          selectAllRowsItem: false,
        }}
        paginationPerPage={15}
        paginationRowsPerPageOptions={[15, 25, 50]}
        noDataComponent={
        <div style={{padding: 24}}>Ningún resultado encontrado.</div>}
      />
    </div>
  )
}