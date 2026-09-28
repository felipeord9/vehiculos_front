import { useState, useEffect } from "react";
import sweal from 'sweetalert'
import * as Bs from "react-icons/bs";
import * as Io from "react-icons/io";
/* import ButtonBack from "../../components/ButtonBack"; */
import ModalAddDrivers from "../../components/ModalAddDrivers";
import { findDrivers , deleteDriver } from '../../services/driverService'
import { config } from "../../config";
import { Modal } from "react-bootstrap";
import * as GoIcons from "react-icons/go";
import { FaTruck } from "react-icons/fa";
import Conductor1 from "../../assets/conductor1.png";
import Conductor2 from "../../assets/conductor2.png";
import Conductor3 from "../../assets/conductor3.png";
import Conductor4 from "../../assets/conductor4.png";
import Conductor5 from "../../assets/conductor5.png";
import Conductor6 from "../../assets/conductor6.png";
import { FaUserEdit } from "react-icons/fa";

function Drivers() {
  const LIMIT = 0;
  const OFFSET = 6;
  const [drivers, setDrivers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalImg, setOpenModalImg] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [pagination, setPagination] = useState({
    limit: LIMIT,
    offset: OFFSET,
  });

  useEffect(() => {
    loadData()
  }, []);

  const loadData = () => {
    findDrivers().then(({data}) => {
      setDrivers(data);
      setSuggestions(data);
    });
  }

  const handlerFilter = (e) => {
    const { value } = e.target;
    const newValue = value.toLowerCase();
    const filter = drivers.filter((elem) => {
      if (
        elem.rowId.includes(value) ||
        elem.name.toLowerCase().includes(newValue)
      ) {
        return elem;
      }
    });
    if (filter.length > 0) {
      setSuggestions(filter);
    } else {
      setSuggestions(drivers);
    }
    setPagination({
      limit: LIMIT,
      offset: OFFSET,
    });
  };

  const expandImg = (imgUrl) => {
    setSelectedImg(imgUrl);
    setOpenModalImg(!openModalImg);
  };

  const handlerShowModalUpdate = (driver) => {
    setSelectedDriver(driver)
    setOpenModalEdit(!openModalEdit)
  }

  //logica para saber si es celular
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 900); // Establecer a true si la ventana es menor o igual a 768px
      };
  
      // Llama a handleResize al cargar y al cambiar el tamaño de la ventana
      window.addEventListener('resize', handleResize);
      handleResize(); // Llama a handleResize inicialmente para establecer el estado correcto
  
      // Elimina el event listener cuando el componente se desmonta
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

  const stickers = [
    Conductor1,     // tarjeta 1
    Conductor2,      // tarjeta 2
    Conductor3,       // tarjeta 3
    Conductor4,     // tarjeta 4
    Conductor5,       // tarjeta 5
    Conductor6,      // tarjeta 6
  ];

  return (
    <div className="container d-flex flex-column w-100 py-3 mt-5" style={{backgroundColor:'white'}}>
      <h1 className="fs-5 fw-bold m-0 w-100 d-flex justify-content-center align-items-center">Conductores</h1>
      <div className={`d-flex ${!isMobile ? 'flex-row' : 'flex-column'} justify-content-between mt-2 gap-2`}>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar por cédula o nombre"
          onChange={handlerFilter}
        />
        <button
          title="Nuevo usuario"
          className="btn btn-primary"
          onClick={(e) => setOpenModal(!openModal)}
          style={{ whiteSpace: "nowrap" }}
        >
          Nuevo conductor
          <FaTruck className="ms-1" style={{width: 15, height: 15}} />
        </button>
        <ModalAddDrivers openModal={openModal} setOpen={setOpenModal} loadData={loadData} />
      </div>
      <div className="row row-cols-sm-2 row-cols-lg-3 justify-content-start mt-2">
        {suggestions
          .slice(pagination.limit, pagination.offset)
          .map((elem, index) => (
            <div className="d-flex justify-content-center">
              <div
                className="card overflow-hidden my-1"
                style={{ width: "18rem", height: "12.5rem" }}
              >
                <img
                  src={
                    elem?.photo
                      ? `${config.apiImg}/${elem.photo}`
                      : stickers[index % stickers.length]   // 👈 usa el sticker correspondiente
                  }
                  alt={`${elem.id}`}
                  height={115}
                />
                <div class="card-body d-flex flex-row justify-content-between align-items-center">
                  <div className="d-flex flex-column" style={{fontSize: 12}}>
                    <span className="text-body-tertiary">ID: {elem.rowId}</span>
                    <h5 class="card-title overflow-hidden w-100 m-0" style={{fontSize: 14}}>
                      {elem.name}
                    </h5>
                  </div>
                  <div class="dropdown dropend">
                    <button
                      class="btn p-1"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FaUserEdit style={{ width: 20 }} />
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <button
                          class="dropdown-item"
                          onClick={(e) => handlerShowModalUpdate(elem)}
                        >
                          Editar
                        </button>
                      </li>
                      <li>
                        <button
                          class="btn btn-danger dropdown-item text-danger"
                          href="..."
                          onClick={(e) => {
                            sweal({
                              title: "¿Está seguro que desea eliminar este conductor?",
                              text: `${elem.rowId} - ${elem.name}`,
                              icon: "warning",
                              dangerMode: true,
                              buttons: ["Cancelar", "Sí, estoy seguro"]
                            }).then((res) => {
                              if(res) {
                                deleteDriver(elem.id)
                                .then((data) => {
                                  sweal({
                                    title: "Conductor eliminado correctamente",
                                    icon: "success",
                                    timer: 3000
                                  })
                                  loadData()
                                })
                              }
                            })
                          }}
                        >
                          Eliminar
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <ModalAddDrivers
        driver={selectedDriver}
        setDriver={setSelectedDriver}
        openModal={openModalEdit}
        setOpen={setOpenModalEdit}
        loadData={loadData}
      />
      <Modal
        show={openModalImg}
        onHide={() => setOpenModalImg(!openModalImg)}
        className="d-block align-items-center"
      >
        <img
          src={`${config.apiImg}/${selectedImg}`}
          alt=""
          className="rounded w-100 h-100"
        />
      </Modal>
      <div
        id="pagination"
        className="d-flex flex-row justify-content-center align-items-center rounded gap-2 mt-3"
      >
        <Io.IoIosArrowBack
          className="text-body-tertiary"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            if (pagination.limit !== 0) {
              setPagination({
                limit: pagination.limit - OFFSET,
                offset: pagination.offset - OFFSET,
              });
            }
          }}
        />
        <div
          className="text-body-tertiary text-center"
          style={{ width: "10rem" }}
        >
          {`${pagination.limit + 1}-${pagination.offset} de ${
            suggestions.length
          }`}
        </div>
        <Io.IoIosArrowForward
          className="text-body-tertiary"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            if (pagination.offset < suggestions.length) {
              setPagination({
                limit: pagination.limit + OFFSET,
                offset: pagination.offset + OFFSET,
              });
            }
          }}
        />
      </div>
    </div>
  );
}

export default Drivers;
