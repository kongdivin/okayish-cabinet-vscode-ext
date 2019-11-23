import CabinetAlterant from './CabinetAlterant';
import CabinetRetriever from './CabinetRetriever';

type CabinetInteractor = CabinetRetriever & CabinetAlterant;

export default CabinetInteractor;