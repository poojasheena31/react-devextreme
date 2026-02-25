import DataGrid, {
  Column,
  Selection,
  Scrolling,
  Paging,
  HeaderFilter,
} from "devextreme-react/data-grid";
import ODataStore from 'devextreme/data/odata/store';

const usersDataSource = new ODataStore({
  key: "UserName",
  url: "/odata/Users",
  version: 4,
  filterToLower: false, // Disable automatic tolower() for all filters
  beforeSend(request) { 
    // Intercept and fix filter for collection properties
    if (request.params && request.params.$filter) {
      console.log('Original filter:', request.params.$filter);
      
      // Replace contains on SourceTags collection with proper any lambda
      request.params.$filter = request.params.$filter.replace(
        /contains\(SourceTags,\s*'([^']+)'\)/gi,
        (_match: string, value: string) => {
          return `SourceTags/any(tag: tag eq '${value}')`;
        }
      );
      console.log('After SourceTags modification:', request.params.$filter);
      
      // Replace contains on scannersFlat with proper Scanners collection any lambda
      request.params.$filter = request.params.$filter.replace(
        /contains\(scannersFlat,\s*'([^']+)'\)/gi,
        (_match: string, value: string) => {
          return `(Scanners/any(s: s/ScannerName eq '${value}'))`;
        }
      );
      
      console.log('Modified filter:', request.params.$filter);
    }
  },
  onLoaded(result) {
    console.log('onLoaded called with result:', result);
    return result.map((item: any) => {
      const scannersFlat = item.Scanners ? item.Scanners.map((s: any) => s.ScannerName).join(', ') : '';
      // console.log('Processing item:', item, 'ScannersFlat:', scannersFlat);
      return {
        ...item,
        sourceTagsFlat: item.SourceTags ? item.SourceTags.join(', ') : '',
        scannersFlat
      };
    });
  }
});

const calculateSourceTagsFilter = (filterValue: any) => {
  return ['SourceTags', 'contains', filterValue];
};

const calculateScannersFilter = (filterValue: any) => {
  return ['scannersFlat', 'contains', filterValue];
};

const calculateScannersCellValue = (rowData: any) => {
  if (rowData.scannersFlat) {
    return rowData.scannersFlat;
  }
  const scanners = rowData.Scanners ?? [];
  if (Array.isArray(scanners) && scanners.length > 0) {
    return scanners.map((s: any) => s.ScannerName).join(', ');
  }
  return '';
};

const App = () => {
  return (
    <div>
      <h2>DevExtreme DataGrid Demo</h2>
      <DataGrid
        id="grid-container"
        dataSource={usersDataSource}
        remoteOperations={true}
        showBorders={true}
      >
        <Selection 
          mode="multiple" 
          deferred 
          selectAllMode="allPages"
          allowSelectAll
          showCheckBoxesMode="always" />
        <HeaderFilter visible={true} />
        <Paging enabled defaultPageSize={10} />
        <Scrolling
          mode="infinite"
          preloadEnabled
          useNative={false}
          columnRenderingMode="virtual"
        />
        <Column caption="Username" dataField="UserName" width="auto" allowFiltering={false} allowHeaderFiltering={false} />
        <Column caption="First Name" dataField="FirstName" width="auto" allowFiltering={false} allowHeaderFiltering={false} />
        <Column caption="Last Name" dataField="LastName" width="auto" allowFiltering={false} allowHeaderFiltering={false} />
        <Column caption="Gender" dataField="Gender" width="auto" allowFiltering={true} allowHeaderFiltering={true}>
          <HeaderFilter 
            allowSelectAll={false}
            dataSource={[
              { text: 'Male', value: 'Male' },
              { text: 'Female', value: 'Female' }
            ]}
          />
        </Column>
        <Column 
          caption="Source Tags" 
          width="auto"

          calculateFilterExpression={calculateSourceTagsFilter}
          calculateCellValue={(rowData: any) => {
            const tags = rowData.SourceTags ?? [];
            return Array.isArray(tags) ? tags.join(', ') : tags;
          }}
          allowFiltering={true}
          allowHeaderFiltering={true}
        >
          <HeaderFilter 
            allowSelectAll={false}
            dataSource={[
              { text: 'Provider A', value: 'Provider A' },
              { text: 'Provider B', value: 'Provider B' },
              { text: 'Provider C', value: 'Provider C' },
              { text: 'Windows', value: 'Windows' }
            ]}
          />
        </Column>
        <Column 
          caption="Scanner" 
          width="auto"
          dataField="scannersFlat"
          calculateFilterExpression={calculateScannersFilter}
          calculateCellValue={calculateScannersCellValue}
          allowFiltering={true}
          allowHeaderFiltering={true}
        >
          <HeaderFilter 
            allowSelectAll={false}
            dataSource={[
              { text: 'Nessus', value: 'NessusScanner' },
              { text: 'Qualys', value: 'QualysScanner' },
              { text: 'Rapid7', value: 'Rapid7Scanner' },
              { text: 'Tenable', value: 'TenableScanner' },
              { text: 'OpenVAS', value: 'OpenVASScanner' }
            ]}
          />
        </Column>
      </DataGrid>
    </div>
  );
};

export default App;