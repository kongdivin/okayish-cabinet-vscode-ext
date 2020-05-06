import CabinetAlterer from './CabinetAlterer';
import CabinetRetriever from './CabinetRetriever';

type CabinetInteractor = CabinetRetriever & CabinetAlterer;

export default CabinetInteractor;