using System;
using System.Collections.Generic;
using System.Globalization;
using System.Xml.Linq;
using Composite.Core.Implementation;
using Composite.Core.Routing;
using Composite.Core.WebClient.Renderings.Page;
using Composite.Data.Types;


namespace Composite.Data
{
    /// <summary>
    /// Represents a page in the C1 CMS sitemap hierarchy.
    /// </summary>
    public class PageNode
    {
        private readonly IPage _page;
        private readonly SitemapNavigatorImplementation _sitemapNavigator;
        
        private XElement _pageElement;
        private int? _level;


        /// <summary>
        ///  Parameterless constructor for Proxy Pattern
        /// </summary>
        /// <exception cref="InvalidOperationException"></exception>
        public PageNode()
        {
            if (this.GetType() == typeof(PageNode))
            {
                throw new InvalidOperationException($"Can't create instance of {nameof(PageNode)} via parameterless constructor. Parameterless constructor used only for Proxy Pattern");
            }
            
        }

        internal PageNode(IPage page, SitemapNavigatorImplementation sitemapNavigator)
        {
            Verify.ArgumentNotNull(page, "page");

            _page = page;
            _sitemapNavigator = sitemapNavigator;
        }


        /// <summary>
        /// The Id of the page
        /// </summary>
        public virtual Guid Id
        {
             get
            {
                return _page.Id;
            }
        }


        /// <summary>
        /// The Title of the page
        /// </summary>
        public virtual string Title
        {
            get
            {
                return _page.Title;
            }
        }


        /// <summary>
        /// The Menu Title of the page
        /// </summary>
        public virtual string MenuTitle
        {
            get
            {
                return string.IsNullOrEmpty(_page.MenuTitle) ? null : _page.MenuTitle;
            }
        }


        /// <summary>
        /// The time the page was changed last
        /// </summary>
        public virtual DateTime ChangedDate
        {
            get
            {
                return _page.ChangeDate;
            }
        }


        /// <summary>
        /// The Description of the page
        /// </summary>
        public virtual string Description
        {
            get
            {
                return _page.Description;
            }
        }


        /// <summary>
        /// Url to this page.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1056:UriPropertiesShouldNotBeStrings")]
        public virtual string Url
        {
            get
            {
                return PageUrls.BuildUrl(_page);
            }
        }


        /// <summary>
        /// The level this page is placed at in the sitemap. Level 1 is a homepage, level 2 are children of the homepage and so on.
        /// </summary>
        public virtual int Level
        {
            get
            {
                if (_level == null)
                {
                    PageNode parent = ParentPage;

                    _level = parent == null ? 1 : parent.Level + 1;
                }

                return _level.Value;
            }
        }


        /// <summary>
        /// Returns the parent <see cref="PageNode"/>.
        /// </summary>
        public virtual PageNode ParentPage
        {
            get
            {
                var parentPageId = PageManager.GetParentId(_page.Id);

                if (parentPageId == Guid.Empty) return null;

                var page = PageManager.GetPageById(parentPageId);

                return page != null ? new PageNode(page, _sitemapNavigator) : null;
            }
        }


        /// <summary>
        /// Returns <see cref="PageNode"/> elements that represent the immediate children of this page.
        /// </summary>
        public virtual IEnumerable<PageNode> ChildPages
        {
            get
            {
                foreach (Guid childId in PageManager.GetChildrenIDs(_page.Id))
                {
                    var page = PageManager.GetPageById(childId);

                    if (page != null)
                    {
                        yield return new PageNode(page, _sitemapNavigator);
                    }
                }
            }
        }


        /// <summary>
        /// Returns <see cref="PageNode"/> elements that is with the <see cref="SitemapScope"/> of this page-
        /// </summary>
        /// <param name="scope">The scope.</param>
        /// <returns></returns>
        public virtual IEnumerable<PageNode> GetPageNodes(SitemapScope scope) 
        {
            if (scope < SitemapScope.Current || scope > SitemapScope.SiblingsAndSelf) throw new ArgumentOutOfRangeException("scope");

            foreach (Guid pageId in GetPageIds(scope))
	        {
                var page = PageManager.GetPageById(pageId);

	            if (page != null)
	            {
                    yield return new PageNode(page, _sitemapNavigator);
	            }
	        }
        }


        /// <summary>
        /// Return the Page Id's that is with the <see cref="SitemapScope"/> of this page-
        /// </summary>
        /// <param name="scope">The scope.</param>
        /// <returns></returns>
        public virtual IEnumerable<Guid> GetPageIds(SitemapScope scope) 
        {
            if (scope < SitemapScope.Current || scope > SitemapScope.SiblingsAndSelf) throw new ArgumentOutOfRangeException("scope");

            return PageStructureInfo.GetAssociatedPageIds(_page.Id, scope);
        }


        /// <summary>
        /// XML representing the page and it's decendants. Do NOT modify this structure. To do modifications, clone this first.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1702:CompoundWordsShouldBeCasedCorrectly", MessageId = "Sitemap")]
        public virtual XElement SitemapXml
        {
            get
            {
                if (_pageElement == null)
                {
                    _pageElement = _sitemapNavigator.GetElementByPageId(_page.Id);
                }

                return _pageElement;
            }
        }


        /// <summary>
        /// Get page for this page node
        /// </summary>
        /// <returns>IPage</returns>
        internal IPage Page => _page;

        /// <summary>
        /// Serialize the page specific state to a string for reading.
        /// </summary>
        /// <returns>
        /// A <see cref="System.String"/> that represents this instance.
        /// </returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "PageNode(Id:'{0}', Title:'{1}', Description:'{2}', MenuTitle:'{3}', Url:'{4}', Level:'{5}')",
                this.Id,
                this.Title,
                this.Description,
                this.MenuTitle,
                this.Url,
                this.Level);
        }
    }
}

namespace Composite.Data.Extensions
{
    /// <exclude />
    public static class PageNodeExtensions
    {
        /// <exclude />
        public static IPage GetPage(this PageNode pageNode)
        {
            return pageNode.Page;
        }
    }
}