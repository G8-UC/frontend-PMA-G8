import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import './PropertyFilters.css';

function PropertyFilters() {
  const { state, dispatch } = useAppContext();
  const { filters } = state;

  const handleFilterChange = (field, value) => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { [field]: value }
    });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="property-filters">
      <div className="filters-header">
        <div className="filters-title">
          <FaFilter className="filter-icon" />
          <h3>Filtrar Propiedades</h3>
        </div>
        {hasActiveFilters && (
          <button 
            className="btn btn-outline btn-sm"
            onClick={clearFilters}
          >
            <FaTimes className="btn-icon" />
            Limpiar
          </button>
        )}
      </div>

      <div className="filters-grid">
        {/* Search */}
        <div className="filter-group">
          <label className="filter-label">Buscar</label>
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o ubicación..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label">Precio mínimo</label>
          <input
            type="number"
            placeholder="Precio mínimo"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Precio máximo</label>
          <input
            type="number"
            placeholder="Precio máximo"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="form-control"
          />
        </div>

        {/* Bedrooms */}
        <div className="filter-group">
          <label className="filter-label">Dormitorios</label>
          <select
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            className="form-control form-select"
          >
            <option value="">Cualquiera</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div className="filter-group">
          <label className="filter-label">Baños</label>
          <select
            value={filters.bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            className="form-control form-select"
          >
            <option value="">Cualquiera</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4+">4+</option>
          </select>
        </div>

        {/* Location */}
        <div className="filter-group">
          <label className="filter-label">Ubicación</label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="form-control form-select"
          >
            <option value="">Todas las ubicaciones</option>
            <option value="Santiago Centro">Santiago Centro</option>
            <option value="Las Condes">Las Condes</option>
            <option value="Providencia">Providencia</option>
            <option value="Ñuñoa">Ñuñoa</option>
            <option value="Maipú">Maipú</option>
            <option value="La Florida">La Florida</option>
            <option value="Puente Alto">Puente Alto</option>
            <option value="Valparaíso">Valparaíso</option>
            <option value="Viña del Mar">Viña del Mar</option>
          </select>
        </div>

        {/* Currency */}
        <div className="filter-group">
          <label className="filter-label">Moneda</label>
          <select
            value={filters.currency}
            onChange={(e) => handleFilterChange('currency', e.target.value)}
            className="form-control form-select"
          >
            <option value="">Todas</option>
            <option value="CLP">Pesos Chilenos (CLP)</option>
            <option value="USD">Dólares (USD)</option>
            <option value="UF">Unidades de Fomento (UF)</option>
          </select>
        </div>

        {/* Date Filter - según OpenAPI */}
        <div className="filter-group">
          <label className="filter-label">Fecha de Publicación</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="form-control"
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>
    </div>
  );
}

export default PropertyFilters;