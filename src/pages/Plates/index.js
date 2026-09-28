import { useState, useEffect } from "react";
import sweal from 'sweetalert'
import * as Bs from "react-icons/bs";
import * as Io from "react-icons/io";
import ModalAddPlates from "../../components/ModalAddPlates";
import { config } from "../../config";
import { Modal } from "react-bootstrap";
import * as GoIcons from "react-icons/go";
import { FaTruck } from "react-icons/fa";
import Placa from "../../assets/placa.png";
import Placa2 from "../../assets/placa2.png";
import { FaUserEdit } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import './styles.css'

function Plates() {
  const LIMIT = 0;
  const OFFSET = 6;
  const [plates, setPlates] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalImg, setOpenModalImg] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedPlate, setSelectedPlate] = useState(null);
  const [pagination, setPagination] = useState({
    limit: LIMIT,
    offset: OFFSET,
  });

  useEffect(() => {
    loadData()
  }, []);

  const loadData = () => {
    /* findPlates().then(({data}) => {
      setPlates(data);
      setSuggestions(data);
    }); */
  }

  const handlerFilter = (e) => {
    const { value } = e.target;
    const newValue = value.toLowerCase();
    const filter = plates.filter((elem) => {
      if (
        elem.plate.toLowerCase().includes(newValue)
      ) {
        return elem;
      }
    });
    if (filter.length > 0) {
      setSuggestions(filter);
    } else {
      setSuggestions(plates);
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

  const handlerShowModalUpdate = (plate) => {
    setSelectedPlate(plate)
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

  return (
    <div className="container d-flex flex-column w-100 py-3 mt-5" style={{backgroundColor:'white'}}>
      <h1 className="fs-5 fw-bold m-0 w-100 d-flex justify-content-center align-items-center">Placas de vehículos</h1>
      <div className={`d-flex ${!isMobile ? 'flex-row' : 'flex-column'} justify-content-between mt-2 gap-2`}>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar por placa"
          style={{textTransform:'uppercase'}}
          onChange={handlerFilter}
        />
        <button
          title="Nuevo usuario"
          className="btn btn-primary"
          onClick={(e) => setOpenModal(!openModal)}
          style={{ whiteSpace: "nowrap" }}
        >
          Nueva placa
          <FaTruck className="ms-1" style={{width: 15, height: 15}} />
        </button>
        <ModalAddPlates openModal={openModal} setOpen={setOpenModal} loadData={loadData} />
      </div>
      <div className="row row-cols-sm-2 row-cols-lg-3 justify-content-start mt-2">
        {suggestions
          .slice(pagination.limit, pagination.offset)
          .map((elem, index) => (
            <div className="d-flex justify-content-center">
              <div
                className="card overflow-hidden my-1 plate-wrapper"
                style={{ width: "18rem", height: "12.5rem" }}
              >
                <img
                  src={Placa2}
                  className="plate-img"
                  alt={`${elem.id}`}
                  height={135}
                />
                <span className="plate-text">{elem.plate}</span>
                <div class="card-body d-flex flex-row justify-content-between align-items-center">
                  <div className="d-flex flex-column" style={{fontSize: 12}}>
                    <h5 class="card-title overflow-hidden w-100 m-0" style={{fontSize: 14}}>
                      Plata: {elem.plate}
                    </h5>
                  </div>
                  <div class="dropdown dropend">
                    <button
                      class="btn p-1"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <MdEditSquare style={{ width: 20 }} />
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
                              title: "¿Está seguro que desea eliminar esta placa?",
                              text: `${elem.plate}`,
                              icon: "warning",
                              dangerMode: true,
                              buttons: ["Cancelar", "Sí, estoy seguro"]
                            }).then((res) => {
                              /* if(res) {
                                deletePlate(elem.id)
                                .then((data) => {
                                  sweal({
                                    title: "Placa eliminada correctamente",
                                    icon: "success",
                                    timer: 3000
                                  })
                                  loadData()
                                })
                              } */
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
      <ModalAddPlates
        plate={selectedPlate}
        setPlate={setSelectedPlate}
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

export default Plates;
